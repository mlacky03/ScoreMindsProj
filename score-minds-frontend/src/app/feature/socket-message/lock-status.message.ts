export interface LockStatusMessage {
    locked: boolean;
    isMe: boolean;
    editorName: string;
    queuePosition: number;
}