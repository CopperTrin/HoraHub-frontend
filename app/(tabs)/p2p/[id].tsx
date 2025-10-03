import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import { useLocalSearchParams, useRouter } from "expo-router";
import BookingModal from "@/app/components/booking/popup";

// --- Mock images ---
import p2p_user_1 from "@/assets/images/p2p/ft1.png";
import p2p_user_2 from "@/assets/images/p2p/ft1.png";
import p2p_user_3 from "@/assets/images/p2p/ft1.png";
import p2p_user_4 from "@/assets/images/p2p/ft1.png";
import p2p_user_5 from "@/assets/images/p2p/ft1.png";
import p2p_user_6 from "@/assets/images/p2p/ft1.png";
import p2p_user_7 from "@/assets/images/p2p/ft1.png";
import p2p_user_8 from "@/assets/images/p2p/ft1.png";
import p2p_user_9 from "@/assets/images/p2p/ft1.png";

const p2pUsers = [
  { id: "1", name: "Dr.ช้าง", imageUrl: p2p_user_1, rate: "30 Baht / 10Min", rating: 4.8, reviews: 251,
    description: "หมอช้าง ทศพร ศรีตุลา เป็นนักพยากรณ์ชื่อดังของประเทศไทย มีความเชี่ยวชาญในโหราศาสตร์ไทยและจีน โดยเฉพาะการดูดวงจากวันเดือนปีเกิดและลายมือ ได้รับความนิยมอย่างกว้างขวางจากผลงานการเขียนหนังสือและออกรายการโทรทัศน์มากมาย" },
  { id: "2", name: "Dr.ลักษณ์", imageUrl: p2p_user_2, rate: "20 Baht / 10Min", rating: 5.0, reviews: 512,
    description: "หมอลักษณ์ ฟันธง ..." },
  { id: "3", name: "Dr.ปลาย", imageUrl: p2p_user_3, rate: "25 Baht / 10Min", rating: 4.9, reviews: 330,
    description: "หมอปลาย พรายกระซิบ ..." },
  { id: "4", name: "Dr.กร", imageUrl: p2p_user_4, rate: "20 Baht / 10Min", rating: 4.7, reviews: 180, description: "..." },
  { id: "5", name: "Dr.วั้งจินต์", imageUrl: p2p_user_5, rate: "20 Baht / 10Min", rating: 4.8, reviews: 210, description: "..." },
  { id: "6", name: "Dr.นาค", imageUrl: p2p_user_6, rate: "20 Baht / 10Min", rating: 4.6, reviews: 150, description: "..." },
  { id: "7", name: "Dr.บ่าบ๋า อ่านคำ", imageUrl: p2p_user_7, rate: "20 Baht / 10Min", rating: 4.9, reviews: 400, description: "..." },
  { id: "8", name: "Dr.ไบท์ เลื่อนจิต", imageUrl: p2p_user_8, rate: "20 Baht / 10Min", rating: 4.8, reviews: 320, description: "..." },
  { id: "9", name: "Dr.โต๊ะ ตาทิพย์", imageUrl: p2p_user_9, rate: "20 Baht / 10Min", rating: 4.9, reviews: 450, description: "..." },
];

const parseRate = (rateStr?: string) => {
  if (!rateStr) return { price: 20, minutes: 10 };
  const price = Number(rateStr.match(/(\d+(?:\.\d+)?)/)?.[1] ?? 20);
  const minutes = Number(rateStr.match(/(\d+)\s*Min/i)?.[1] ?? 10);
  return { price, minutes };
};

export default function P2pPage() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id || "";
  const router = useRouter();

  const [showBooking, setShowBooking] = useState(false);
  const [selection, setSelection] = useState<{ date?: string; time?: string }>({});

  const user = p2pUsers.find((p) => p.id === id);

  if (!user) {
    return (
      <ScreenWrapper>
        <HeaderBar title="ไม่พบหมอดู" showBack onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center bg-[#140E25]">
          <Text className="text-white text-lg">ไม่พบข้อมูลหมอดูที่คุณค้นหา</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const { price, minutes } = parseRate(user.rate);

  return (
    <ScreenWrapper>
      <HeaderBar title={user.name} showBack onBackPress={() => router.back()} showChat />
      <ScrollView className="bg-primary-200" contentContainerStyle={{ paddingBottom: 32 }}>
        <Image source={user.imageUrl} className="w-full h-80" resizeMode="cover" />
        <View className="p-4">
          <Text className="text-white text-3xl font-bold mb-1">{user.name}</Text>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-yellow-400 text-xl font-bold">{user.rate}</Text>

            {/* ⭐ กดรีวิว -> ไปหน้าที่ path: /(tabs)/p2p/review พร้อมส่ง id */}
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push(`/(tabs)/p2p/review?id=${user.id}`)}
              activeOpacity={0.8}
            >
              <Text className="text-yellow-400 text-lg mr-1">⭐</Text>
              <Text className="text-white text-lg font-semibold">
                {user.rating.toFixed(1)}{" "}
                <Text className="text-gray-00">({user.reviews} Reviews)</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#2D2A32] p-4 rounded-xl mb-8">
            <Text className="text-gray-300 text-base leading-6">{user.description}</Text>
          </View>

          {selection.date && selection.time ? (
            <View className="bg-[#2D2A32] p-3 rounded-lg mb-3">
              <Text className="text-gray-200">🚀 คุณเลือก {selection.date} เวลา {selection.time}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            className="bg-purple-600 py-4 rounded-xl active:bg-purple-700 shadow-lg shadow-purple-500/50"
            onPress={() => setShowBooking(true)}
          >
            <Text className="text-center text-white text-xl font-bold">Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BookingModal
        visible={showBooking}
        onClose={() => setShowBooking(false)}
        onSelect={(date, time) => {
          setSelection({ date, time });
          // popup เป็นคน push ไป confirm แล้ว
        }}
        teller={{
          id: user.id,
          name: user.name,
          price,
          minutes,
          detail: user.description,
        }}
      />
    </ScreenWrapper>
  );
}
