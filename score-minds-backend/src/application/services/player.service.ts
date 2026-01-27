import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FullPlayerDto } from '../dtos/players-dto/full-player.dto';
import { PlayerRepository } from 'src/infrastucture/persistence/repositories/player.repository';
@Injectable()
export class PlayerService {
  constructor(
    @Inject(PlayerRepository)
    private readonly playerRepository: PlayerRepository,
  ) { }


  async findByTeam(teamId: number): Promise<FullPlayerDto[]> {
    const res = await this.playerRepository.findByTeamId(teamId);
    return res.map((p) => new FullPlayerDto(p));
  }




  async findOne(id: number): Promise<FullPlayerDto> {
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new NotFoundException(`Igrač sa ID-jem ${id} nije pronađen.`);
    }

    return new FullPlayerDto(player);
  }

  async findMany(externalIds: number[]): Promise<FullPlayerDto[]> {
    const players = await this.playerRepository.findMany(externalIds);
    return players.map((p) => new FullPlayerDto(p));
  }
}