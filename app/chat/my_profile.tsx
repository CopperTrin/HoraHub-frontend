import axios from "axios";
import { useEffect, useState } from "react";
import fcomponent from "../fcomponent";

interface UserInfo {
  UserInfoID: string;
  UserID: string;
  FirstName: string;
  LastName: string;
  PictureURL: string;
  Email: string;
  GoogleID: string;
}

interface User {
  UserID: string;
  Username: string;
  Password: string;
  Role: string[];
  UserInfo: UserInfo;
}

// ✅ Hook ดึงโปรไฟล์ตัวเอง
export const userProfile = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const API_URL = fcomponent.getBaseURL();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await fcomponent.getToken();
        const response = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return userInfo;
};

export const user = (userId: string | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const API_URL = fcomponent.getBaseURL();

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const token = await fcomponent.getToken();
        const res = await axios.get(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [userId]);

  return user;
};

export const myUsername = () => {
  const userInfo = user(userProfile()?.UserID);
  return userInfo?.Username || null;
};

export default {
  myProfile: userProfile,
  user,
  myUsername: myUsername
}