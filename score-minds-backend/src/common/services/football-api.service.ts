import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
@Injectable()
export class FootballApiService {

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  private get apiKey() {
    return this.configService.get<string>('FOOTBALL_API_KEY');
  }

  private get baseUrl() {
    return this.configService.get<string>('FOOTBALL_API_URL');
  }

  async getMatches(leagueId: number, season: number) {
    const url = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}`;

    console.log("Pokušavam fetch na URL:", url);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": "56e0bea445d94bc6110e6e51fdcb9136",
        }
      });

      const data = await res.json();

      console.log("Status:", data.get);
      console.log("Podaci sa API-ja:", data.response.length);


      return data.response || [];


    } catch (error) {
      console.error("Greška:", error.message);
      return [];
    }
  }

  // async getMatches(leagueId: number, season: number) {
  //   const response = await lastValueFrom(
  //     this.httpService.get(`${this.baseUrl}/fixtures`, {
  //       params: { league: leagueId, season: season },
  //       headers: {'x-apisports-key': this.apiKey }
  //     })
  //   );
  //   return response.data.response; 
  // }

  async getPlayersByTeam(teamId: number) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/players/squads`, {
          params: { team: teamId },
          headers: { 'x-apisports-key': this.apiKey }
        })
      );
      
      if (response.data.errors && Object.keys(response.data.errors).length > 0) {
        console.error(`❌ API GREŠKA za tim ${teamId}:`, JSON.stringify(response.data.errors, null, 2));
        return [];
      }
      if (!response.data.response || response.data.response.length === 0) {
        console.warn(`⚠️ Nema podataka o igračima za tim ID: ${teamId}. Preskačem.`);
        return [];
      }
      return response.data.response[0]?.players || [];
    } catch (error) {
      console.error("Greška:", error.message);
      return [];
    }

  }
}