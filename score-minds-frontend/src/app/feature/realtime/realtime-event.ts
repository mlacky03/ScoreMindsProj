export interface PendingPredictionEvent {
  predictionEvent: {
    id: number;
    type: string;
    groupId: number;
    paidById: number;
  };
  paidByName: string;
  groupName: string;
  groupCurrencyCode: string;
  me: { memberId: number; status: 'pending' | 'accepted' | 'declined' | null };
}

export interface ResponsePredictionEvent {
  expense: {
    id: number;
    title: string;
    amount: number;
    groupId: number;
    paidById: number;
  };
  respondFrom: string;
  groupName: string;
  groupCurrencyCode: string;
  status: 'accepted' | 'declined';
}



export interface FinalizedPredictionEvent {
  expense: {
    id: number;
    title: string;
    amount: number;
    groupId: number;
    paidById: number;
  };
  expensePartcipantsCount: number; // This is the acceptedCount
  groupName: string;
  groupCurrencyCode: string;
}


export type UserEvent =
  | { type: 'heartbeat'; data: string }
  | { type: 'open'; data: 'ready' }
  | { type: 'prediction.pending'; data: PendingPredictionEvent }
  | { type: 'prediction.responded'; data: ResponsePredictionEvent }
  | { type: 'prediction.finalized'; data: FinalizedPredictionEvent };

export type RealtimeEventType = UserEvent['type'];

export const isType =
  <T extends RealtimeEventType>(t: T) =>
  (e: UserEvent): e is Extract<UserEvent, { type: T }> =>
    e?.type === t;