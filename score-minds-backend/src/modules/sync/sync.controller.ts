import { Controller, Get, Query, Param, ParseIntPipe, Put, Body } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {UseGuards} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateMatchDto } from '../matches/dto/update-match.dto';
@ApiTags('Sync Data')
@ApiBearerAuth('JWT-auth') //Mora se promeni da bude samo za admina
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) { }

  @UseGuards(JwtAuthGuard)
  @Get('matches')
  async syncMatches(
    @Query('league', ParseIntPipe) leagueId: number,
    @Query('season', ParseIntPipe) season: number,
  ) {

  
    await this.syncService.syncLeagueMatches(leagueId, season);
    
    return { message: `Mečevi za ligu ${leagueId} i sezonu ${season} su uspešno povučeni.` };
  }
  @UseGuards(JwtAuthGuard)
  @Get('players/:teamId')
  async syncPlayers(@Param('teamId', ParseIntPipe) teamId: number) {
    await this.syncService.syncPlayersForTeam(teamId);
    return { message: `Igrači tima ${teamId} su uspešno ažurirani u bazi.` };
  }

  @UseGuards(JwtAuthGuard)
  @Get('update-results')
  async updateResults(
    @Query('league', ParseIntPipe) leagueId: number,
    @Query('season', ParseIntPipe) season: number,
  ) {
    await this.syncService.syncLeagueMatches(leagueId, season);
    return { message: 'Rezultati su osveženi.' };
  }

  @Put('match/:id/score')
  async updateScore(
    @Param('id') id: number, 
    @Body() dto: UpdateMatchDto
  ) {
    return this.syncService.simulateMatchUpdate(id, dto);
  }
}