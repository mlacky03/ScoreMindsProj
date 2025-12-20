import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MatchService } from './matches.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Matches')
@Controller('matches') 
export class MatchController {
  constructor(private readonly matchService: MatchService) {}


 @UseGuards(JwtAuthGuard)
  @Get()
  async getAllMatches() {
    return await this.matchService.findAll();
  }

 
 @UseGuards(JwtAuthGuard)
  @Get('upcoming')
  async getUpcomingMatches() {
    return await this.matchService.findUpcoming();
  }

  
 @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getMatchById(@Param('id', ParseIntPipe) id: number) {
    return await this.matchService.findOne(id);
  }
}