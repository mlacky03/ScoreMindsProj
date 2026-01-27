import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMatchDto {
  @ApiProperty({ description: 'Rezultat domaćina', example: 1 })
  @IsNumber()
  homeScore: number;

  @ApiProperty({ description: 'Rezultat gosta', example: 0 })
  @IsNumber()
  awayScore: number;

  @ApiProperty({ description: 'Minut utakmice', example: 45 })
  @IsNumber()
  minute: number;

  @ApiProperty({ description: 'Status: 1H (prvo pol), 2H (drugo), FT (kraj)', example: 'LIVE' })
  @IsString()
  status: string;

  @IsNumber()
  @ApiProperty({ description: 'ID utakmice', example: 1 })
  scorerIds: number[];

  @IsNumber()
  @ApiProperty({ description: 'ID kartice', example: 1 })
  assistIds: number[];
}
