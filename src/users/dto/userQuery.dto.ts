import { Transform, Type } from 'class-transformer';
import { toNumber } from '../../common/helper/cast.helper';
import {
  IsDefined,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class UserSearchQueryDto {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  email: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  age: number;
}

class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  public page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  public take = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}

export class UserQueryDto {
  @IsDefined()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserSearchQueryDto)
  search: UserSearchQueryDto;

  @IsDefined()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}
