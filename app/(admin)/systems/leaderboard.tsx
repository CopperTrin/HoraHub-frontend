import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeadersBar from "@/app/components/ui/HeaderBar";
import axios from "axios";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import fcomponent from "../../fcomponent";

const CreateLeaderboard = () => {
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState<number>(0.0);
  const API_URL = fcomponent.getBaseURL();

  const submitLeaderBoard = async () => {
    if (!description.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกคำอธิบาย");
      return;
    }
    if (isNaN(prize) || prize <= 0) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกรางวัลเป็นตัวเลขที่ถูกต้อง");
      return;
    }
    try {
      const token = await fcomponent.getToken();
      const response = await axios.post(`${API_URL}/leaderboards`,
        { Description: description,
          Prize_Pool: prize},
        {headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" }
      });

      if (response.status) {
        Alert.alert("สำเร็จ", "กระดานผู้นำของคุณถูกสร้างแล้ว");
        setDescription("");
        setPrize(0.0);
      } else {
        Alert.alert("ผิดพลาด", "ไม่สามารถสร้างได้");
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
        title="Create Leaderboard" 
        showBack />

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-2">

        <Text className="text-alabaster text-base mb-3">
          คำอธิบาย
        </Text>

        <TextInput
          className="flex-1 w-full min-h-[120px] max-h-[200px] border border-accent-200 rounded-2xl p-3 text-alabaster mb-2"
          placeholder="เขียนรายละเอียดที่นี่..."
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
          scrollEnabled
          textAlignVertical="top"
          maxLength={500} // จำกัดจำนวนตัวอักษร
        />

        <Text className="text-alabaster text-base mb-3">
            รางวัลรวม
        </Text>

        <TextInput
          className="w-full h-12 border border-accent-200 rounded-2xl p-3 text-alabaster mb-8"
          placeholder="กรอกจำนวนรางวัล..."
          placeholderTextColor="#aaa"
          keyboardType="numeric" // ให้คีย์บอร์ดเป็นตัวเลข
          value={prize ? prize.toString() : ""}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9.]/g, "");
            setPrize(parseFloat(numericValue) || 0);
          }}
          maxLength={12}
        />

        <TouchableOpacity
          className="bg-accent-200 rounded-2xl py-3 mb-5"
          onPress={submitLeaderBoard}
        >
          <Text className="text-blackpearl font-semibold text-center">
            สร้าง
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default CreateLeaderboard;