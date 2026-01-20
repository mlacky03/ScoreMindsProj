import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';   
import { FullPlayerDto } from './dto/full-player.dto';
import { BaseService } from 'src/common/services/base.service';
@Injectable()
export class PlayerService extends BaseService<Player> {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {super(playerRepository)}

  
  async findByTeam(teamId: number): Promise<FullPlayerDto[]> {
    const res=await this.playerRepository.find({
      where: { teamId: teamId },
      order: { name: 'ASC' }, 
    });
    return res.map((p) => new FullPlayerDto(p));
  }

  


  async findOne(externalId: number): Promise<FullPlayerDto > {
    const player = await this.playerRepository.findOne({ where: { externalId } });
    if (!player) {
      throw new NotFoundException(`Igrač sa ID-jem ${externalId} nije pronađen.`);
    }
    
    return new FullPlayerDto(player);
  }
}