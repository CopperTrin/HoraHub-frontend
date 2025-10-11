import { Alert, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import HeaderBar from "./components/ui/HeaderBar";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Platform } from "react-native";

const getBaseURL = () => {
  if (Platform.OS === "android") return "http://10.0.2.2:3456";
  return "http://localhost:3456";
};

export default function ApplyVerification() {
  const [cvFile, setCvFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });

    if (!result.canceled) {
      setCvFile(result.assets[0]);
      Alert.alert("แนบไฟล์สำเร็จ", result.assets[0].name);
    }
  };

  const handleSubmit = async () => {
    if (!cvFile) {
      Alert.alert("แจ้งเตือน", "กรุณาแนบไฟล์ CV ก่อนส่ง");
      return;
    }

    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) {
        Alert.alert("ข้อผิดพลาด", "ไม่พบ token กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: cvFile.uri,
        name: cvFile.name,
        type: cvFile.mimeType || "application/pdf",
      } as any);

      const response = await axios.patch(`${getBaseURL()}/fortune-teller/cv`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("CV uploaded:", response.data);

      setLoading(false);
      Alert.alert("ส่งสำเร็จ!", "ทีมงานจะตรวจสอบภายใน 1–3 วันทำการ", [
        { text: "ตกลง", onPress: () => router.push("/(tabs)/profile") },
      ]);
      setCvFile(null);
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error.message);
      if (error.response?.status === 403) {
        Alert.alert("ถูกปฏิเสธสิทธิ์", "บัญชีนี้ยังไม่ได้เป็นหมอดู กรุณาเข้าสู่ระบบด้วยสิทธิ์ FORTUNE_TELLER");
      } else {
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดไฟล์ได้");
      }
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <HeaderBar title="ยืนยันตัวตนหมอดู" />

      <View className="flex-1 px-6 py-8">
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-2">ส่งเอกสารยืนยันตัวตน</Text>
          <Text className="text-gray-400 text-base leading-6">
            กรุณาแนบไฟล์ CV ของคุณ เพื่อให้ทีม HoraHub ตรวจสอบข้อมูลของคุณก่อนเปิดใช้งานบัญชีหมอดู
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePickCV}
          activeOpacity={0.8}
          className="bg-white/10 border border-gray-500 rounded-2xl p-5 flex-row items-center justify-between mb-3"
        >
          <View className="flex-row items-center">
            <Ionicons name="document-attach-outline" size={26} color="#FFD824" />
            <Text className="text-gray-200 ml-3 text-base">
              {cvFile ? cvFile.name : "แนบไฟล์ CV (PDF / Word)"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        {cvFile && (
          <View className="mb-5 bg-white/5 border border-[#FFD824] rounded-2xl p-4">
            <Text className="text-gray-300">{cvFile.name}</Text>
            <Text className="text-gray-400 text-sm mt-1">
              ขนาด: {((cvFile.size || 0) / (1024 * 1024)).toFixed(2)} MB
            </Text>
          </View>
        )}

        <TouchableOpacity
          disabled={loading}
          onPress={handleSubmit}
          activeOpacity={0.9}
          className={`rounded-2xl py-4 ${
            loading ? "bg-gray-400" : "bg-[#FFD824]"
          } shadow-md shadow-black/30`}
        >
          {loading ? (
            <View className="flex-row justify-center items-center space-x-2">
              <ActivityIndicator />
              <Text className="font-bold text-lg ml-2">กำลังส่ง...</Text>
            </View>
          ) : (
            <Text className="text-center font-bold text-lg text-blackpearl">
              ส่งตรวจสอบ
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
