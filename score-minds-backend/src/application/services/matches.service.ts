import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FullMatchDto } from '../dtos/matches-dto/full-match.dto';
import { BaseMatchDto } from '../dtos/matches-dto/base-match.dto';
import { MatchRepository } from 'src/infrastucture/persistence/repositories/match.repository';

@Injectable()
export class MatchService  {

  constructor(
    @Inject(MatchRepository)
    private readonly matchRepository: MatchRepository,
  
  ) {}

  async findMatchesByIds(ids:number[]):Promise<BaseMatchDto[]>{
    const res=await this.matchRepository.findMatchesByIds(ids);
    return res.map((m)=>new BaseMatchDto(m));
  }

  async findAll(): Promise<BaseMatchDto[]> {
    const res=await this.matchRepository.findAll();
    return res.map((m)=>new BaseMatchDto(m));
  }

  
  async findUpcoming(): Promise<BaseMatchDto[]> {
    const res= await this.matchRepository.findUpcoming();
    return res.map((m)=>new BaseMatchDto(m));
  }

  
  async findOne(id: number): Promise<FullMatchDto> {
    const match = await this.matchRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Meč sa ID-jem ${id} nije pronađen.`);
    }
    return new FullMatchDto(match);
  }

  async findLiveMatches(): Promise<BaseMatchDto[]> {
    const res= await this.matchRepository.findLiveMatches();
    return res.map((m)=>new BaseMatchDto(m));
  }
}