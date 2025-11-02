import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeadersBar from "@/app/components/ui/HeaderBar";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
  const route = useRoute();
  const { id } = route.params as { id: string };
  const API_URL = fcomponent.getBaseURL();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await fcomponent.getToken();
        const res = await axios.get(`${API_URL}/leaderboards/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data
        setDescription(data.Description);
        setPrize(data.Prize_Pool);
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
      }
    };

    fetchData();
  }, []);

  const delLeaderBoard = async () => {
    try {
      const token = await fcomponent.getToken();
      const response = await axios.delete(`${API_URL}/leaderboards/${id}`,
        {headers: {Authorization: `Bearer ${token}`}
      });
        if (response.status) {
        Alert.alert("สำเร็จ", "กระดานผู้นำของคุณถูกลบแล้ว");
        setDescription("");
        setPrize(0.0);
        router.replace("../systems/leaderboard_list");
      } else {
        Alert.alert("ผิดพลาด", "ไม่สามารถลบได้");
      }
    } catch (error) {
      console.error("Report error:", error);
      Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
    };

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
      const response = await axios.patch(`${API_URL}/leaderboards/${id}`,
        { Description: description,
          Prize_Pool: prize},
        {headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" }
      });

      if (response.status) {
        Alert.alert("สำเร็จ", "กระดานผู้นำของคุณถูกแก้ไขแล้ว");
        setDescription("");
        setPrize(0.0);
        router.replace("../systems/leaderboard_list");
      } else {
        Alert.alert("ผิดพลาด", "ไม่สามารถแก้ไขได้");
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
        title="Edit Leaderboard" 
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
          maxLength={500} 
        />

        <Text className="text-alabaster text-base mb-3">
            รางวัลรวม
        </Text>

        <TextInput
          className="w-full h-12 border border-accent-200 rounded-2xl p-3 text-alabaster mb-8"
          placeholder="กรอกจำนวนรางวัล..."
          placeholderTextColor="#aaa"
          keyboardType="numeric"
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
          <Text className="text-blackpearl font-semibold text-center">แก้ไข</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-400 rounded-2xl py-3 mb-5"
          onPress={delLeaderBoard}
        >
          <Text className="text-blackpearl font-semibold text-center">ลบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default CreateLeaderboard;