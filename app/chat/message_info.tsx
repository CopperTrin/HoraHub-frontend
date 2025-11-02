export interface UserInfo {
  UserInfoID: string;
  UserID: string;
  FirstName: string;
  LastName: string;
  PictureURL: string;
  Email: string;
  GoogleID: string;
}

export interface Sender {
  UserID: string;
  Username: string;
  Password: string;
  Role: string[];
  UserInfo: UserInfo;
}

export interface Message {
  MessageID: string;
  ConversationID: string;
  SenderID: string;
  Content: string;
  MessageType: 'TEXT' | 'IMAGE'; 
  FileURL?: string;
  FileName?: string;
  FileSize?: number;
  CreatedAt: string;
  UpdatedAt: string;
  IsEdited: boolean;
  IsDeleted: boolean;
  Sender: Sender;
  MessageStatuses: any[];
}
