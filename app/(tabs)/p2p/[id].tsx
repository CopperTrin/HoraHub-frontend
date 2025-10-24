import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import { useLocalSearchParams, useRouter } from "expo-router";

// --- Mock images ---
import p2p_user_1 from "@/assets/images/p2p/ft1.png";
import p2p_user_2 from "@/assets/images/p2p/ft1.png";
import p2p_user_3 from "@/assets/images/p2p/ft1.png";
import p2p_user_4 from "@/assets/images/p2p/ft1.png";

// ===== Mock Data =====
const p2pUsers = [
    { id: "1", name: "Dr.ช้าง ทศพร", imageUrl: p2p_user_1, rating: 4.8, reviews: 251, description: "หมอช้าง ทศพร ศรีตุลา เป็นนักพยากรณ์ชื่อดังของประเทศไทย..." },
    { id: "2", name: "Dr.ลักษณ์ ราชสีห์", imageUrl: p2p_user_2, rating: 5.0, reviews: 512, description: "หมอลักษณ์ ฟันธง ..." },
    { id: "3", name: "Dr.ปลาย พรายกระซิบ", imageUrl: p2p_user_3, rating: 4.9, reviews: 330, description: "หมอปลาย พรายกระซิบ ..." },
    { id: "4", name: "Dr.คฑา ชินบัญชร", imageUrl: p2p_user_4, rating: 4.7, reviews: 180, description: "ไพ่ยิปซีแม่นยำ..." },
];

export default function P2pDetailPage() {
  const params = useLocalSearchParams<{ id?: string, serviceName?: string, price?: string, duration?: string }>();
  const router = useRouter();

  const providerId = params.id || "";
  const serviceName = params.serviceName || "บริการ";
  const servicePrice = Number(params.price) || 0;
  const serviceDuration = Number(params.duration) || 10;
  
  const user = p2pUsers.find((p) => p.id === providerId);

  if (!user) { /* ... โค้ด error เหมือนเดิม ... */ }
  
  const handleBookingPress = () => {
    // ==========================================================
    // ===== แก้ไขแค่จุดนี้: เปลี่ยน pathname และ params =====
    // ==========================================================
    router.push({
      pathname: '/p2p/confirm', // <-- **เปลี่ยน** ไปที่หน้า confirm
      params: {
        providerId: user.id, // <-- **เปลี่ยน** เป็น providerId เพื่อความชัดเจน
        serviceName: serviceName,
        price: servicePrice,
        duration: serviceDuration,
      }
    });
    // ==========================================================
  };

  return (
    <ScreenWrapper>
      <HeaderBar title={user.name} showBack onBackPress={() => router.back()} showChat />
      <ScrollView className="bg-primary-200" contentContainerStyle={{ paddingBottom: 32 }}>
        <Image source={user.imageUrl} className="w-full h-80" resizeMode="cover" />
        <View className="p-4">
          <Text className="text-white text-3xl font-bold mb-1">{serviceName}</Text>
          <Text className="text-gray-300 text-lg mb-3">โดย {user.name}</Text>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-yellow-400 text-xl font-bold">{servicePrice} Baht / {serviceDuration} Min</Text>
            <TouchableOpacity className="flex-row items-center" activeOpacity={0.8}>
              <Text className="text-yellow-400 text-lg mr-1">⭐</Text>
              <Text className="text-white text-lg font-semibold">{user.rating.toFixed(1)} <Text className="text-gray-400">({user.reviews} Reviews)</Text></Text>
            </TouchableOpacity>
          </View>
          <View className="bg-[#2D2A32] p-4 rounded-xl mb-8">
            <Text className="text-gray-300 text-base leading-6">{user.description}</Text>
          </View>
          <TouchableOpacity className="bg-purple-600 py-4 rounded-xl active:bg-purple-700" onPress={handleBookingPress}>
            <Text className="text-center text-white text-xl font-bold">Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}