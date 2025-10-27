import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeadersBar from "@/app/components/ui/HeaderBar";
import { useRoute } from "@react-navigation/native";
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

const CreateCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const route = useRoute();
  const API_URL = fcomponent.getBaseURL();

  const submitCategory = async () => {
    if (!name.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อ");
      return;
    }
    if (!description.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกคำอธิบาย");
      return;
    }
    if (!type.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกประเภท");
      return;
    }
    try {
      const token = await fcomponent.getToken();
      const response = await axios.post(`${API_URL}/service-categories`,
        {Category_name: name,
          Category_Description: description,
          Category_type: type},
        {headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" }
      });

      if (response.status) {
        Alert.alert("สำเร็จ", "หมวดหมู่ของคุณถูกสร้างแล้ว");
        setName("");
        setDescription("");
        setType("");
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
        title="Create Service Category" 
        showBack />

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-2">
        <Text className="text-alabaster text-base mb-3">
          ชื่อหมวดหมู่
        </Text>

        <TextInput
          className="w-full h-12 border border-accent-200 rounded-2xl p-3 text-alabaster mb-4"
          placeholder="เขียนชื่อที่นี่..."
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          textAlignVertical="top"
          maxLength={45} // จำกัดจำนวนตัวอักษร
        />

        <Text className="text-alabaster text-base mb-3">
          คำอธิบาย
        </Text>

        <TextInput
          className="flex-1 w-full min-h-[120px] max-h-[200px] border border-accent-200 rounded-2xl p-3 text-alabaster mb-4"
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
            ประเภท
        </Text>

        <TextInput
          className="w-full h-12 border border-accent-200 rounded-2xl p-3 text-alabaster mb-8"
          placeholder="เขียนประเภทที่นี่..."
          placeholderTextColor="#aaa"
          value={type}
          onChangeText={setType}
          textAlignVertical="top"
          maxLength={45} // จำกัดจำนวนตัวอักษร
        />

        <TouchableOpacity
          className="bg-accent-200 rounded-2xl py-3 mb-5"
          onPress={submitCategory}
        >
          <Text className="text-blackpearl font-semibold text-center">
            สร้าง
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default CreateCategory;