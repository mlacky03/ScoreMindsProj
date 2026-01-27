import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { PlayerService } from '../../application/services/player.service';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Players')
@ApiBearerAuth('JWT-auth')
@Controller('players')
export class PlayerController {
    constructor(private readonly playerService: PlayerService) { }

    @UseGuards(JwtAuthGuard)
    @Get('team/:teamId')
    async getPlayersByTeam(@Param('teamId', ParseIntPipe) teamId: number) {
        return await this.playerService.findByTeam(teamId);
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getPlayerById(@Param('id', ParseIntPipe) id: number) {
        return await this.playerService.findOne(id);
    }

}