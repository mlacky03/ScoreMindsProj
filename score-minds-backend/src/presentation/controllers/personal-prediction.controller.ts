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
    async findAll(@CurrentUser() id: number):Promise<BasePredictionDto[]> {
        const predictions = await this.predictionService.findAll(id);
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
