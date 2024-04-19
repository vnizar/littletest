import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateSchedule {
  @IsNotEmpty()
  readonly date: string;

  @IsNotEmpty()
  readonly time: string;

  @IsEmail()
  readonly email: string;
}
