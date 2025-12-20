import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {UseGuards} from '@nestjs/common';

@ApiTags('Sync Data')
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
}