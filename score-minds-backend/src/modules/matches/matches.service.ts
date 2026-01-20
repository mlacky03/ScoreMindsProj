import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Match } from './matches.entity';
import { FullMatchDto } from './dto/full-match.dto';
import {BaseMatchDto} from './dto/base-match.dto';
import {BaseService} from 'src/common/services/base.service';

@Injectable()
export class MatchService extends BaseService<Match> {

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    
  ) {super(matchRepository)}

 
  async findAll(): Promise<BaseMatchDto[]> {
    const res=await this.matchRepository.find({
      order: { startTime: 'ASC' }, 
    });
    return res.map((m)=>new BaseMatchDto(m));
  }

  
  async findUpcoming(): Promise<BaseMatchDto[]> {
    const res= await this.matchRepository.find({
      where: {
        status: 'NS',
      },
      order: { startTime: 'ASC' },
    });

    
    return res.map((m)=>new BaseMatchDto(m));
  }

  
  async findOne(id: number): Promise<FullMatchDto> {
    const match = await this.matchRepository.findOne({ 
      where: { id },
      relations: ['predictions'] 
    });

    if (!match) {
      throw new NotFoundException(`Meč sa ID-jem ${id} nije pronađen.`);
    }
    return new FullMatchDto(match);
  }
}