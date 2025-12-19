import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
@Injectable()
export class FootballApiService {
  private readonly apiKey = 'TVOJ_RAPID_API_KEY';
  private readonly baseUrl = 'https://api-football-v1.p.rapidapi.com/v3';

  constructor(private readonly httpService: HttpService) {}

  async getMatches(leagueId: number, season: number) {
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/fixtures`, {
        params: { league: leagueId, season: season },
        headers: { 'x-rapidapi-key': this.apiKey }
      })
    );
    return response.data.response; 
  }

  async getPlayersByTeam(teamId: number) {
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/players/squads`, {
        params: { team: teamId },
        headers: { 'x-rapidapi-key': this.apiKey }
      })
    );
    return response.data.response[0].players; 
  }
}