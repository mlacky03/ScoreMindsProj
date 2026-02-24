import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MatchService } from '../../application/services/matches.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Matches')
@ApiBearerAuth('JWT-auth')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) { }


  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllMatches(
    @Query('page') page: string,
    @Query('size') size: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const sizeNumber = size ? parseInt(size, 10) : 10;
    return await this.matchService.findAll(pageNumber, sizeNumber);
  }

  @Get('ids')
  async getMatchesByIds(@Query('ids') ids: string) {
    if (!ids) return [];
    const idsArray = ids.split(',').map(id => parseInt(id));
    return await this.matchService.findMatchesByIds(idsArray);
  }


  @UseGuards(JwtAuthGuard)
  @Get('upcoming')
  async getUpcomingMatches(
    @Query('page') page: string,
    @Query('size') size: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const sizeNumber = size ? parseInt(size, 10) : 10;
    return await this.matchService.findUpcoming(pageNumber, sizeNumber);
  }
  @UseGuards(JwtAuthGuard)
  @Get('live')
  async getLiveMatches(
    @Query('page') page: string,
    @Query('size') size: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const sizeNumber = size ? parseInt(size, 10) : 10;
    return await this.matchService.findLiveMatches(pageNumber, sizeNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getMatchById(@Param('id', ParseIntPipe) id: number) {
    return await this.matchService.findOne(id);
  }


}