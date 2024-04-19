import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Appointment } from './schedule.interface';
import { CreateSchedule } from './dto/create-schedule.dto';
import { Schedule } from './schemas/schedule.schema';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(':date')
  async getScheduleByDate(
    @Param('date') dateString: string,
  ): Promise<Appointment[]> {
    return await this.scheduleService.getScheduleByDate(dateString);
  }

  @Post('book')
  async setSchedule(@Body() createSchedule: CreateSchedule): Promise<Schedule> {
    return await this.scheduleService.createSchedule(createSchedule);
  }
}
