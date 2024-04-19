import { BadRequestException, Injectable } from '@nestjs/common';
import { Appointment } from './schedule.interface';
import { CreateSchedule } from './dto/create-schedule.dto';
import { Schedule } from './schemas/schedule.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
  ) {}
  private maxSlot = parseInt(process.env.MAX_SLOT) || 1;
  private startTime = parseInt(process.env.START_TIME) || 9;
  private endTime = parseInt(process.env.END_TIME) || 18;
  private slotDuration = parseInt(process.env.SLOT_DURATION) || 30;

  async getScheduleByDate(dateString: string): Promise<Appointment[]> {
    if (!this.isValidDate(dateString)) {
      throw new BadRequestException('Invalid date');
    }

    return await this.generateSchedulesByDate(dateString);
  }

  async createSchedule(createSchedule: CreateSchedule): Promise<Schedule> {
    if (!this.isValidDate(createSchedule.date)) {
      throw new BadRequestException('Invalid date');
    }

    if (!this.isValidTime(createSchedule.time)) {
      throw new BadRequestException('Invalid time');
    }

    if (!this.isWorkdays(createSchedule.date)) {
      throw new BadRequestException('Non working days');
    }

    const schedules = await this.getScheduleByDateAndTime(
      createSchedule.date,
      createSchedule.time,
    );

    if (schedules.length >= this.maxSlot) {
      throw new BadRequestException('No available slot');
    }

    if (this.isSlotBookedByEmail(createSchedule.email, schedules)) {
      throw new BadRequestException('Already booked a slot');
    }

    const schedule = new this.scheduleModel({
      email: createSchedule.email,
      date: new Date(createSchedule.date),
      time: createSchedule.time,
    });

    return schedule.save();
  }

  async generateSchedulesByDate(dateString: string): Promise<Appointment[]> {
    return new Promise(async (resolve, reject) => {
      const times: Appointment[] = [];
      const start = new Date();
      const end = new Date();
      const schedules = await this.scheduleModel
        .find({ date: { $eq: new Date(dateString) } })
        .exec();

      start.setHours(this.startTime, 0, 0);
      end.setHours(this.endTime, 0, 0);
      for (
        let i = new Date(start);
        i <= end;
        i.setMinutes(i.getMinutes() + this.slotDuration)
      ) {
        const scheduleTime = i.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const bookedTime = schedules.filter(
          (item) => item.time == scheduleTime,
        );
        const availableSlot =
          bookedTime.length > 0
            ? this.maxSlot - bookedTime.length
            : this.maxSlot;

        times.push({
          date: dateString,
          time: scheduleTime,
          available_slot: availableSlot > 0 ? availableSlot : 0,
        });
      }

      resolve(times);
    });
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private isValidTime(timeString: string): boolean {
    const regex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
    return regex.test(timeString);
  }

  private isWorkdays(dateString: string): boolean {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const workdays = process.env.OPERATIONAL_DAYS.split(',').map((item) =>
      item.toLocaleLowerCase(),
    );
    const date = new Date(dateString);
    return workdays.includes(daysOfWeek[date.getDay()].toLocaleLowerCase());
  }

  private isSlotBookedByEmail(email: string, schedules: Schedule[]): boolean {
    let result = false;
    schedules.forEach((item) => {
      if (email == item.email) {
        result= true;
      }
    });

    return result;
  }

  private async getScheduleByDateAndTime(
    dateString: string,
    timeString: string,
  ): Promise<Schedule[]> {
    return await this.scheduleModel
      .find({ date: { $eq: new Date(dateString) }, time: { $eq: timeString } })
      .exec();
  }
}
