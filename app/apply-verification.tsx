import { Alert, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import HeaderBar from "./components/ui/HeaderBar";
import ScreenWrapper from "@/app/components/ScreenWrapper";

export default function ApplyVerification() {
  const [cvFile, setCvFile] = useState(null);
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

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert("ส่งสำเร็จ!", "ทีมงานจะตรวจสอบภายใน 1–3 วันทำการ", [
        { text: "ตกลง", onPress: () => router.push('/(tabs)/profile') },
      ]);
      setCvFile(null);
    }, 1000);
  };

  return (
    <ScreenWrapper >
      <HeaderBar title="ยืนยันตัวตนหมอดู" />

      <View className="flex-1 px-6 py-8">
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-2">ส่งเอกสารยืนยันตัวตน</Text>
          <Text className="text-gray-400 text-base leading-6">
            กรุณาแนบไฟล์ CV ของคุณ (PDF หรือ Word) เพื่อให้ทีม HoraHub ตรวจสอบข้อมูลของคุณก่อนเปิดใช้งานบัญชีหมอดู
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
            <Text className="text-gray-300 color-accent-200">{cvFile.name}</Text>
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
              <Text className=" font-bold text-lg">กำลังส่ง...</Text>
            </View>
          ) : (
            <Text className="text-center font-bold text-lg">
              ส่งตรวจสอบ
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </ScreenWrapper>
  );
}
