import ScreenWrapper from "@/app/components/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import {
  GoogleSignin, statusCodes
} from '@react-native-google-signin/google-signin';
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const getBaseURL = () => "https://softdev-horahub-backend-production.up.railway.app";

export default function ApplyVerification() {
  const [cvFile, setCvFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (!token) return;

        const me = await axios.get(`${getBaseURL()}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = me.data?.UserID;
        if (!userId) return;

        const ft = await axios.get(
          `${getBaseURL()}/fortune-teller/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatus(ft.data?.Status || null);
        setCvUrl(ft.data?.CVURL || "");
      } catch (err) {
        console.error("Fetch fortune teller info error:", err);
      }
    })();
  }, []);

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

      // console.log("CV uploaded:", response.data);
      Alert.alert("ส่งสำเร็จ!", "ทีมงานจะตรวจสอบภายใน 1–3 วันทำการ");
      setCvFile(null);
      setCvUrl("uploaded");
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error.message);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดไฟล์ได้");
    } finally {
      setLoading(false);
    }
  };


  const handleBackToSignIn = async () => {
    try {
      const hadPrev = typeof GoogleSignin.hasPreviousSignIn === "function"
        ? GoogleSignin.hasPreviousSignIn()
        : false;
  
      if (hadPrev) {
        try {
          await GoogleSignin.revokeAccess();
        } catch (e: any) {
          if (e?.code !== statusCodes.SIGN_IN_REQUIRED) throw e;
        }
        try {
          await GoogleSignin.signOut();
        } catch (e: any) {
          if (e?.code !== statusCodes.SIGN_IN_REQUIRED) throw e;
        }
      }

      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("user_role");
      await SecureStore.deleteItemAsync("last_id_token");
      await SecureStore.deleteItemAsync("last_google_uid");
  
      router.replace("/(tabs)/profile");
    } catch (e: any) {
      console.error("Sign out error:", e?.message || e);
      Alert.alert("ไม่สามารถออกจากระบบได้", "โปรดลองอีกครั้ง");
    }
  };

  useEffect(() => {
    if (status === "ACTIVE") {
      router.replace("/(fortune-teller)/profile");
    }
  }, [status]);

  const renderUploadButton = (label: string, isResubmit?: boolean) => (
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
        <Text className="text-center font-bold text-lg text-black">
          {isResubmit ? "ส่งเอกสารใหม่" : label}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View className="flex-row items-center p-4 border-b border-gray-700">
        <TouchableOpacity onPress={handleBackToSignIn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={26} color="#FFD824" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold ml-3">
          ยืนยันตัวตนหมอดู
        </Text>
      </View>

      <View className="flex-1 px-6 py-8">
        {status === "PENDING" && cvUrl ? (
          <View>
            <Text className="text-white text-2xl font-bold mb-3">
              กำลังตรวจสอบเอกสาร
            </Text>
            <Text className="text-gray-400 mb-6">
              ทีมงานกำลังตรวจสอบข้อมูลของคุณ กรุณารอ 1–3 วันทำการ
            </Text>

            <TouchableOpacity
              onPress={handlePickCV}
              activeOpacity={0.8}
              className="bg-[#FFD824]/20 border border-[#FFD824] rounded-2xl p-5 flex-row items-center justify-between mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="document-attach-outline"
                  size={26}
                  color="#FFD824"
                />
                <Text className="text-gray-200 ml-3 text-base">
                  อัปโหลดใหม่ (ถ้าต้องการ)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            {cvFile && renderUploadButton("ส่งเอกสารใหม่", true)}
          </View>
        ) : status === "INACTIVE" && cvUrl ? (
          // 🔴 กรณี INACTIVE (ถูกปฏิเสธ)
          <View>
            <Text className="text-red-400 text-2xl font-bold mb-3">
              เอกสารถูกปฏิเสธ
            </Text>
            <Text className="text-gray-400 mb-6">
              เอกสารที่คุณส่งถูกปฏิเสธ กรุณาตรวจสอบและอัปโหลดใหม่อีกครั้ง
            </Text>

            <TouchableOpacity
              onPress={handlePickCV}
              activeOpacity={0.8}
              className="bg-red-400/20 border border-red-400 rounded-2xl p-5 flex-row items-center justify-between mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="document-attach-outline"
                  size={26}
                  color="#FFD824"
                />
                <Text className="text-gray-200 ml-3 text-base">
                  แนบไฟล์ CV ใหม่
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            {cvFile && renderUploadButton("ส่งเอกสารใหม่", true)}
          </View>
        ) : (
          <View>
            <Text className="text-white text-2xl font-bold mb-2">
              ส่งเอกสารยืนยันตัวตน
            </Text>
            <Text className="text-gray-400 text-base leading-6 mb-6">
              กรุณาแนบไฟล์ CV ของคุณ เพื่อให้ทีม HoraHub ตรวจสอบข้อมูลของคุณก่อนเปิดใช้งานบัญชีหมอดู
            </Text>

            <TouchableOpacity
              onPress={handlePickCV}
              activeOpacity={0.8}
              className="bg-white/10 border border-gray-500 rounded-2xl p-5 flex-row items-center justify-between mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="document-attach-outline"
                  size={26}
                  color="#FFD824"
                />
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

            {renderUploadButton("ส่งตรวจสอบ")}
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
