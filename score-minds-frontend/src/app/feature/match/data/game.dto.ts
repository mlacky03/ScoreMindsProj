import { PlayerFullDto } from "../../players/data/player-full.dto";
import { MatchFullDto } from "./match-full.dto";

export interface GameDto
{
    match:MatchFullDto;
    players:PlayerFullDto[];
}