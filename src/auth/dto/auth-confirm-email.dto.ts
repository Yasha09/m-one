import { IsNotEmpty, IsString } from 'class-validator';

export class AuthConfirmEmailDto {
  @IsNotEmpty()
  @IsString()
  hash: string;
}
