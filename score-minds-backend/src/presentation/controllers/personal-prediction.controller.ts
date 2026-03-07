import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    FileTypeValidator,
    ForbiddenException,
    Get,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Patch,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { PersonalPredictionService } from '../../application/services/personal-prediction.service';
import { CreatePredictionDto } from '../../application/dtos/personal-prediction-dto/create-prediction.dto';
import { UpdatePredictionDto } from '../../application/dtos/personal-prediction-dto/update-prediction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FullPredictionDto } from '../../application/dtos/personal-prediction-dto/full-prediction.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BasePredictionDto } from '../../application/dtos/personal-prediction-dto/base-prediction.dto';
import { PaginatedResponse } from '../../application/dtos/pagination-dto/paginatio.dto';
import { BaseUserDto } from 'src/application/dtos/user-dto/base-user.dto';
@ApiTags('Personal Predictions')
@ApiBearerAuth('JWT-auth')
@Controller('personal-predictions')
export class PersonalPredictionController {
    constructor(
        private readonly predictionService: PersonalPredictionService
    ) { }
    
    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createPrediction(@Body() createPredictionDto: CreatePredictionDto,  @CurrentUser() id: number):Promise<FullPredictionDto> {
        return await this.predictionService.createPrediction(id, createPredictionDto);;
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    async findAll(@CurrentUser() id: number,@Query('page') page: string,
        @Query('size') size: string,@Query('mode') mode:string):Promise<PaginatedResponse<BasePredictionDto>> {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const sizeNumber = size ? parseInt(size, 10) : 10;
        const predictions = await this.predictionService.findAll(id,pageNumber,sizeNumber,mode);
        return predictions;
    }

    @Put('update/:predictionId')
    @UseGuards(JwtAuthGuard)
    async updatePrediction(@Param('predictionId') predictionId: number, @Body() updatePredictionDto: UpdatePredictionDto, @CurrentUser() id: number):Promise<FullPredictionDto> {
        
        return await this.predictionService.updatePrediction(predictionId,  id,updatePredictionDto);
    }

    @Get('find/:predictionId')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('predictionId') predictionId: number, @CurrentUser() id: number):Promise<FullPredictionDto> {
        
        return await this.predictionService.findOne(predictionId,id);
    }

    @Delete('delete/:predictionId')
    @UseGuards(JwtAuthGuard)
    async deletePrediction(@Param('predictionId') predictionId: number, @CurrentUser() id: number):Promise<{message: string}> {
        
        return await this.predictionService.deletePrediction(predictionId, id);
    }
}
