import { Message } from "./message_info";

export interface UserInfo {
  UserInfoID: string;
  UserID: string;
  FirstName: string;
  LastName: string;
  PictureURL: string;
  Email: string;
  GoogleID: string;
}

export interface User {
  UserID: string;
  Username: string;
  Password: string;
  Role: string[];
  UserInfo: UserInfo;
}

export interface Participant {
  ParticipantID: string;
  ConversationID: string;
  UserID: string;
  JoinedAt: string;
  User: User;
}

export interface ConversationCount {
  Messages: number;
}

export interface ChatRoomInfo {
  ConversationID: string;
  CreatedAt: string;
  UpdatedAt: string;
  Participants: Participant[];
  Messages: Message[];
  _count: ConversationCount;
}
