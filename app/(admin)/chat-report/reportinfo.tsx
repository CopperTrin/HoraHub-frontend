export interface UserInfo {
  FirstName: string;
  LastName: string;
  PictureURL: string;
  Email: string;
}

export interface User {
  UserID: string;
  Username: string;
  UserInfo: UserInfo;
}

export interface Report {
  ReportID: string;
  Reporter: User;
  ReportedUser: User;
  Reason: string;
  Description: string;
  CreatedAt: string;
}