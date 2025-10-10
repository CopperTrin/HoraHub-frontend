import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeadersBar from "@/app/components/ui/HeaderBar";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { navigate } from "expo-router/build/global-state/routing";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import fcomponent from "../fcomponent";

const ReportChat = () => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const route = useRoute();
  const { otherId } = route.params as { otherId: string };
  const API_URL = fcomponent.getBaseURL();

  const submitReport = async () => {
    if (!details.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกรายละเอียดก่อนส่งรายงาน");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกเหตุผลก่อนส่งรายงาน");
      return;
    }
    console.log("id", otherId)
    console.log("reason", reason)
    console.log("detail", details)
    try {
      const token = await fcomponent.getToken();
      const response = await axios.post(`${API_URL}/reports`,
        {ReportedID: otherId,
          Reason: reason,
          Description: details},
        {headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" }
      });

      if (response.status) {
        Alert.alert("สำเร็จ", "รายงานของคุณถูกส่งแล้ว");
        setReason("");
        setDetails("");
        navigate("../chat/index");
      } else {
        Alert.alert("ผิดพลาด", "ไม่สามารถส่งรายงานได้");
      }
    } catch (error) {
      console.error("Report error:", error);
      Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <HeadersBar 
        title="Report Chat" 
        showBack />

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-2">
        <Text className="text-alabaster text-base mb-3">
          เหตุผล
        </Text>

        <TextInput
          className="w-full h-12 border border-accent-200 rounded-2xl p-3 text-alabaster mb-8"
          placeholder="เขียนเหตุผลที่นี่..."
          placeholderTextColor="#aaa"
          value={reason}
          onChangeText={setReason}
          textAlignVertical="top"
          maxLength={40} // จำกัดจำนวนตัวอักษร
        />

        <Text className="text-alabaster text-base mb-3">
          โปรดระบุรายละเอียดของการสนทนาที่ไม่เหมาะสม
        </Text>

        <TextInput
          className="w-full min-h-[120px] max-h-[200px] border border-accent-200 rounded-2xl p-3 text-alabaster mb-2"
          placeholder="เขียนรายละเอียดที่นี่..."
          placeholderTextColor="#aaa"
          value={details}
          onChangeText={setDetails}
          multiline
          scrollEnabled
          textAlignVertical="top"
          maxLength={500} // จำกัดจำนวนตัวอักษร
        />

        <Text className="text-alabaster text-xs ml-2 mr-2 mb-2">
          ผู้ใช้ยินยอมให้ทีมงาน HoraHub เข้าถึงข้อมูลการสนทนานี้เพื่อวัตถุประสงค์ในการตรวจสอบ
        </Text>

        <TouchableOpacity
          className="bg-accent-200 rounded-2xl py-3 mb-5"
          onPress={submitReport}
        >
          <Text className="text-blackpearl font-semibold text-center">
            ส่งรายงาน
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ReportChat;