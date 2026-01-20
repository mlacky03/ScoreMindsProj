import {WinnerOption} from "../prediction.entity";
import { IsString,IsOptional,IsNumber,IsEnum } from "class-validator";


export class CreatePredictionDto{
    @IsOptional()
    @IsNumber()
    predictedHomeScore:number;

    @IsOptional()
    @IsNumber()
    predictedAwayScore:number;

    @IsOptional()
    @IsEnum(WinnerOption, {
    message: 'Winner mora biti jedna od opcija: HOME, AWAY ili DRAW'
    })
    @IsString()
    winner:WinnerOption;



    @IsOptional()
    @IsNumber()
    matchId:number;
   
}