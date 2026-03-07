import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { GroupPredictionService } from "src/application/services/group-prediction.service";
import { CreatePredictionDto } from "src/application/dtos/group-prediction-dto/create-prediction.dto";
import { FullPredictionDto } from "src/application/dtos/group-prediction-dto/full-prediction.dto";
import { UpdatePredictionDto } from "src/application/dtos/group-prediction-dto/update-prediction.dto";
import { BasePredictionDto } from "src/application/dtos/group-prediction-dto/base-prediction.dto";
import { PaginatedResponse } from "src/application/dtos/pagination-dto/paginatio.dto";

@ApiTags('Group Predictions')
@ApiBearerAuth('JWT-auth')
@Controller('group-predictions')
export class GroupPredictionController {
    constructor(
        private readonly groupPredictionService: GroupPredictionService
    ) { }
    
    @Post('create/:groupId')
    @UseGuards(JwtAuthGuard)
    async createPrediction(@Body() createPredictionDto: CreatePredictionDto,  @CurrentUser() id: number, @Param('groupId') groupId: number):Promise<FullPredictionDto> {
        return await this.groupPredictionService.createPrediction(groupId, createPredictionDto, id);;
    }

    @Get('all/:groupId')
    @UseGuards(JwtAuthGuard)
    async findAll(@CurrentUser() id: number, @Param('groupId') groupId: number,@Query('page') page: string,
            @Query('size') size: string,@Query('mode') mode:string):Promise<PaginatedResponse<BasePredictionDto>> {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const sizeNumber = size ? parseInt(size, 10) : 10;
        const predictions = await this.groupPredictionService.findAll(groupId,id,pageNumber,sizeNumber,mode);
        return predictions;
    }

    @Put(':groupId/:predictionId')
    @UseGuards(JwtAuthGuard)
    async updatePrediction(@Param('predictionId') predictionId: number, @Body() updatePredictionDto: UpdatePredictionDto, @CurrentUser() id: number,@Param('groupId') groupId: number):Promise<FullPredictionDto> {
        
        return await this.groupPredictionService.updatePrediction(predictionId,  id,updatePredictionDto,groupId);
    }

    @Get(':groupId/:predictionId')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('predictionId') predictionId: number, @CurrentUser() id: number,@Param('groupId') groupId: number):Promise<FullPredictionDto> {
        
        return await this.groupPredictionService.findOne(predictionId,groupId,id);
    }

    @Delete(':groupId/:predictionId')
    @UseGuards(JwtAuthGuard)
    async deletePrediction(@Param('predictionId') predictionId: number, @CurrentUser() id: number,@Param('groupId') groupId: number):Promise<{message: string}> {
        
        return await this.groupPredictionService.deletePrediction(predictionId, groupId,id);
    }
}