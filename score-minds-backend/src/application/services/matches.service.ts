import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FullMatchDto } from '../dtos/matches-dto/full-match.dto';
import { BaseMatchDto } from '../dtos/matches-dto/base-match.dto';
import { MatchRepository } from 'src/infrastucture/persistence/repositories/match.repository';

@Injectable()
export class MatchService {

  constructor(
    @Inject(MatchRepository)
    private readonly matchRepository: MatchRepository,

  ) { }

  async findMatchesByIds(ids: number[]): Promise<BaseMatchDto[]> {
    const res = await this.matchRepository.findMatchesByIds(ids);
    return res.map((m) => new BaseMatchDto(m));
  }

  async findAll(page:number,size:number): Promise<BaseMatchDto[]> {
    const skip=(page-1)*size;
    const res = await this.matchRepository.findAllPagginated(skip,size);
    return res.map((m) => new BaseMatchDto(m));
  }


  async findUpcoming(page:number,size:number): Promise<BaseMatchDto[]> {
     const skip=(page-1)*size;
    const res = await this.matchRepository.findUpcomingPagginated(skip,size);
    return res.map((m) => new BaseMatchDto(m));
  }


  async findOne(id: number): Promise<FullMatchDto> {
    const match = await this.matchRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Meč sa ID-jem ${id} nije pronađen.`);
    }
    return new FullMatchDto(match);
  }

  async findLiveMatches(page:number,size:number): Promise<BaseMatchDto[]> {
    const skip=(page-1)*size;
    const res = await this.matchRepository.findLiveMatchesPagginated(skip,page);
    return res.map((m) => new BaseMatchDto(m));
  }
}