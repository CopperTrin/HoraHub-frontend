import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const getBaseURL = () => "https://softdev-horahub-backend-production.up.railway.app";

const getToken = async () => {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) {
        // console.log('No access token found');
        router.replace("/(tabs)/profile");
        return;
    }
    return token;}

const formatChatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    // ถ้าเป็นวันนี้ → แสดงเวลา เช่น "14:30"
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // ถ้าไม่ใช่วันนี้ → แสดงวันที่ เช่น "8 ต.ค. 2025"
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }
};

export default { getBaseURL, getToken, formatChatTime };