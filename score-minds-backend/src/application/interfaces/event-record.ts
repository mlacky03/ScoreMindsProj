export interface EventRecord {
  playerId: number;
  minute: number;
  type?: 'GOAL' | 'ASSIST'; 
}