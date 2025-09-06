export interface User {
  id: string;
  username: string;
  room?: string;
}

export interface Message {
  id: string;
  text: string;
  from: string;
  to: string; // User ID or room name
  timestamp: Date;
  type: 'direct' | 'group';
}

export interface JoinRoomData {
  username: string;
  room: string;
}