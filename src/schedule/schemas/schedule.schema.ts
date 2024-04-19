import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema()
export class Schedule {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
