import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { FootballApiService } from "../../common/services/football-api.service";
import { Adapter } from "../../common/patterns/Adapter";
import { UpdateMatchDto } from "../dtos/matches-dto/update-match.dto";
import { ClientProxy } from "@nestjs/microservices";
import { MatchRepository } from "src/infrastucture/persistence/repositories/match.repository";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Match } from "src/domain/models/match.model";


@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private b=0;
  constructor(
    private footballApi: FootballApiService,
    @Inject(MatchRepository)
    private matchRepo: MatchRepository,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
    private adapter: Adapter,
  ) { }

  @Cron(CronExpression.EVERY_MINUTE) 
  async startMatches() {
    const now = new Date();

   
    const matchesToStart = await this.matchRepo.findMatchToStart();

    if (matchesToStart.length === 0) return;

    this.logger.log(`Starting ${matchesToStart.length} matches... ⚽`);

    for (const match of matchesToStart) {
      match.updateStart();
      
      await this.matchRepo.save(match);
      this.notifySystem(match,0);
      //this.rabbitClient.emit("match_started", {matchId: match.id,status:match.status});
      this.logger.log(`Match STARTED: ${match.homeTeamName} vs ${match.awayTeamName}`);
    }
  }

  @Cron('*/30 * * * * *') 
  async simulateLiveMatches() {
 
    const liveMatches = await this.matchRepo.findLiveMatches();
    if (liveMatches.length === 0) return;

    for (const match of liveMatches) {
      const now = new Date();
      
      const minutesPlayed = Math.floor((now.getTime() - match.startTime.getTime()) / 60000);

      const MATCH_DURATION = 2; 
      
      if (minutesPlayed >= MATCH_DURATION) {
        match.finishMatch();
        await this.matchRepo.save(match);

        this.notifySystem(match,minutesPlayed);
        this.logger.log(`Match FINISHED: ${match.homeTeamName} ${match.finalScoreHome}-${match.finalScoreAway} ${match.awayTeamName} 🏁`);
        continue; 
      }

      //Math.random() < 0.1
      
     
      if (this.b===0) { 
        this.scoreGoal(match,minutesPlayed);
        await this.matchRepo.save(match);
        this.notifySystem(match,minutesPlayed);
        this.b++;
      }
    }
  }

  private scoreGoal(match: Match,minuts:number) {
    // const isHomeGoal = Math.random() > 0.5;

    // if (isHomeGoal) {
    //   match.updateHomeScore((match.finalScoreHome || 0) + 1);
    //   match.updateGoalscorer(123, minuts);
    //   match.updateAssistant(456, minuts);
    //   this.logger.log(`GOAL! ${match.homeTeamName} scores! ⚽`);
      

    // } else {
    //   match.updateAwayScore((match.finalScoreAway || 0) + 1);
    //   match.updateGoalscorer(123, minuts);
    //   match.updateAssistant(456, minuts);
    //   this.logger.log(`GOAL! ${match.awayTeamName} scores! ⚽`);
    // }
        match.updateAwayScore((match.finalScoreAway   || 0) + 1);
        match.updateGoalscorer(85, 23);
        match.updateAssistant(80, 66);

        match.updateHomeScore(3);

  }

  async syncLeagueMatches(leagueId: number, season: number): Promise<{ message: string }> {
    const apiMatches = await this.footballApi.getMatches(leagueId, season);
    console.log(`API je vratio ${apiMatches?.length} mečeva.`);

    const matchesPayload = apiMatches.map(m => this.adapter.adaptToMatchModel(m));

    const chunks = chunkArray(matchesPayload, 100);

    for (const chunk of chunks) {

      this.rabbitClient.emit('sync_league_matches', chunk);

    }
    return { message: "Utakmice su uspesno poslate u RabbitMQ." };
  }

  async syncPlayersForTeam() {
    const match = await this.matchRepo.playerSync(43);

    //const teamIds = match.flatMap(m => [m.homeTeamId, m.awayTeamId]);
    const teamIds = [540,530,529,548,531];
    const uniqueTeamIds = new Set(teamIds);
    
    for (const teamId of uniqueTeamIds) {
      const apiPlayers = await this.footballApi.getPlayersByTeam(teamId);
      if (!apiPlayers || apiPlayers.length === 0) continue;

      const uniquePlayersMap = new Map();


      for (const p of apiPlayers) {

        const model = this.adapter.adaptToPlayerModel(p, teamId);

        if (model.externalId) {
          uniquePlayersMap.set(model.externalId, model);
        }
      }
      const playersToSave = Array.from(uniquePlayersMap.values());

      if (playersToSave.length > 0) {
        this.rabbitClient.emit('sync_players_for_team', playersToSave);

      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

  }


  async checkApiStatus() {


    const url = "https://v3.football.api-sports.io/status";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": "56e0bea445d94bc6110e6e51fdcb9136"
        }
      });

      const data = await response.json();
      console.log("STATUS PROVERA:", JSON.stringify(data, null, 2));

      return data;
    } catch (err) {
      console.error("STATUS GREŠKA:", err.message);
    }
  }
  async simulateMatchUpdate(matchId: number, dto: UpdateMatchDto): Promise<{ message: string }> {

    const payload = {
      id:matchId,  
      status: dto.status, 
      finalScoreHome: dto.homeScore, 
      finalScoreAway: dto.awayScore, 
      actualScorersIds: dto.scorerIds, 
      actualAssistantsIds: dto.assistIds, 
    };

    this.rabbitClient.emit('update_match', payload);

    console.log(`📢 SIMULACIJA: Rezultat promenjen na ${dto.homeScore}:${dto.awayScore} (${dto.status})`);

    return { message: "Utakmica je uspesno poslata u RabbitMQ." };
  }

  private notifySystem(match: Match,minutesPlayed) {
    const payload = {
      id: match.id, 
      status: match.status,
      finalScoreHome: match.finalScoreHome,
      finalScoreAway: match.finalScoreAway,
      events: match.events,
      minutes: minutesPlayed
    };

    if(match.status === 'FT') {
      this.rabbitClient.emit('match_finished', payload);
    }
    this.rabbitClient.emit('update_match', payload);
    this.rabbitClient.emit('update_match_list', { id: match.id, status: match.status,finalScoreHome: match.finalScoreHome,
      finalScoreAway: match.finalScoreAway,minutes:minutesPlayed });

  }


}
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

