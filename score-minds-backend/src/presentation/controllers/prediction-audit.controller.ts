import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    FileTypeValidator,
    ForbiddenException,
    Get,

    Param,
    UseGuards,


} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PredictionAuditService } from '../../application/services/prediction-audit.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Predictions Audit')
@ApiBearerAuth('JWT-auth')
@Controller('prediction-audit')
export class PredictionAuditController {
    constructor(private readonly predictionAuditService: PredictionAuditService) { }

    @Get("get/:predictionId")
    @UseGuards(JwtAuthGuard)
    async FindById(@Param('predictionId') predictionId: number, @CurrentUser() id: number) {
        return this.predictionAuditService.getAuditByPredictionId(predictionId, id);
    }
}
