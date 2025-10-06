// app/(tabs)/p2p/confirm.tsx
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";

// --- Mock data import (ใช้ชุดเดียวกับ P2pPage) ---
import p2p_user_1 from "@/assets/images/p2p/ft2.png";
import p2p_user_2 from "@/assets/images/p2p/ft2.png";
import p2p_user_3 from "@/assets/images/p2p/ft2.png";
import p2p_user_4 from "@/assets/images/p2p/ft2.png";
import p2p_user_5 from "@/assets/images/p2p/ft2.png";
import p2p_user_6 from "@/assets/images/p2p/ft2.png";
import p2p_user_7 from "@/assets/images/p2p/ft2.png";
import p2p_user_8 from "@/assets/images/p2p/ft2.png";
import p2p_user_9 from "@/assets/images/p2p/ft2.png";

const p2pUsers = [
  { id: "1", name: "Dr.ช้าง", imageUrl: p2p_user_1, available: true },
  { id: "2", name: "Dr.ลักษณ์", imageUrl: p2p_user_2, available: true },
  { id: "3", name: "Dr.ปลาย", imageUrl: p2p_user_3, available: true },
  { id: "4", name: "Dr.คฑา", imageUrl: p2p_user_4, available: true },
  { id: "5", name: "Dr.วั้ง อินดี้", imageUrl: p2p_user_5, available: false },
  { id: "6", name: "Dr.นาค", imageUrl: p2p_user_6, available: true },
  { id: "7", name: "Dr.บาบา วานก้า", imageUrl: p2p_user_7, available: false },
  { id: "8", name: "Dr.ไนท์ เชื่อมจิต", imageUrl: p2p_user_8, available: true },
  { id: "9", name: "Dr.โก๊ะ ตาทิพย์", imageUrl: p2p_user_9, available: true },
];

type PayMethod = "card" | "promptpay" | "debit";

export default function ConfirmScreen() {
  const [pay, setPay] = useState<PayMethod>("promptpay");

  // params ที่ส่งมาจาก BookingModal หรือ P2pPage
  const { id, date, time } = useLocalSearchParams<{
    id?: string;
    date?: string;
    time?: string;
  }>();

  // หา user จาก id
  const user = p2pUsers.find((u) => u.id === id) || {
    name: "ไม่พบหมอดู",
    imageUrl: p2p_user_1,
  };

  const detail = "ดูดวงชะตาตามวันเดือนปีเกิด";
  const priceBaht = 20;
  const totalMin = 10;

  const startText =
    date && time ? `เริ่ม ${date} เวลา ${time}` : "ยังไม่ได้เลือกเวลา";

  return (
    <ScreenWrapper>
      <HeaderBar
        title="P2P"
        rightIcons={[
          { name: "calendar-month", onPress: () => console.log("Booking tapped") },
        ]}
        showSearch
        showChat
        showBack
      />

      <View className="flex-1 bg-[#140E25]">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-5 pt-6">
            <Text className="text-white text-xl font-semibold">{user.name}</Text>

            <View className="mt-4 flex-row items-center gap-4">
              <Image
                source={user.imageUrl}
                className="w-20 h-20 rounded-xl"
              />
              <View className="flex-1">
                <Text className="text-white/90">{startText}</Text>
                <Text className="text-white/70 mt-0.5">{detail}</Text>
                <Text className="text-[#B66CFF] font-extrabold mt-1">
                  {priceBaht} baht
                </Text>
              </View>
            </View>
          </View>

          {/* TOTAL TIME */}
          <SectionTitle title="TOTAL TIME" />
          <View className="px-5 mt-2">
            <View className="bg-[#211C37] rounded-xl h-11 px-4 justify-center">
              <Text className="text-white/90">{totalMin} MIN</Text>
            </View>
          </View>

          {/* TOTAL PRICE */}
          <SectionTitle title="TOTAL PRICE" />
          <View className="px-5 mt-2">
            <View className="bg-[#211C37] rounded-xl h-11 px-4 flex-row items-center justify-between">
              <Text className="text-white/90">{priceBaht.toFixed(2)}</Text>
              <Text className="text-white/60">Baht</Text>
            </View>
          </View>

          {/* Payment */}
          <View className="px-5 mt-6 space-y-3">
            <RadioItem label="Card credit" selected={pay === "card"} onPress={() => setPay("card")} />
            <RadioItem label="Promptpay" selected={pay === "promptpay"} onPress={() => setPay("promptpay")} />
            <RadioItem label="Debit" selected={pay === "debit"} onPress={() => setPay("debit")} />
          </View>

          <View className="h-6" />
        </ScrollView>

        {/* Confirm button */}
        <View className="px-5 pb-20">
          <TouchableOpacity
            className="h-14 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: "#9333EA",
              shadowColor: "#9333EA",
              shadowOpacity: 0.35,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
            activeOpacity={0.9}
            onPress={() => {
              console.log("Confirm booking with:", pay, date, time, user.name);
            }}
          >
            <Text className="text-white font-bold text-lg">Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

/* ----------------- sub components ----------------- */
function SectionTitle({ title }: { title: string }) {
  return (
    <View className="px-5 mt-6">
      <Text className="text-white/80 tracking-widest text-[12px]">{title}</Text>
    </View>
  );
}

function RadioItem({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="border border-white/20 rounded-xl h-14 px-4 flex-row items-center justify-between bg-[#1F1A33]"
    >
      <View className="flex-row items-center gap-3">
        <RadioCircle selected={selected} />
        <Text className="text-white/90">{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <View className="w-5 h-5 rounded-full border border-white/50 items-center justify-center">
      {selected ? <View className="w-3 h-3 rounded-full bg-[#B66CFF]" /> : null}
    </View>
  );
}
