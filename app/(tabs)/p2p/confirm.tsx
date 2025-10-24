import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";

// --- Mock images ---
import p2p_user_1 from "@/assets/images/p2p/ft1.png";
import p2p_user_2 from "@/assets/images/p2p/ft1.png";
import p2p_user_3 from "@/assets/images/p2p/ft1.png";
import p2p_user_4 from "@/assets/images/p2p/ft1.png";

// ===== Mock Data (ไม่ต้องใช้ savedCards และ mobileBanks แล้ว) =====
const p2pUsers = [
    { id: "1", name: "Dr.ช้าง ทศพร", imageUrl: p2p_user_1, rating: 4.8, reviews: 251 },
    { id: "2", name: "Dr.ลักษณ์ ราชสีห์", imageUrl: p2p_user_2, rating: 5.0, reviews: 512 },
    { id: "3", name: "Dr.ปลาย พรายกระซิบ", imageUrl: p2p_user_3, rating: 4.9, reviews: 330 },
    { id: "4", name: "Dr.คฑา ชินบัญชร", imageUrl: p2p_user_4, rating: 4.7, reviews: 180 },
];

// ===== แก้ไข: เพิ่ม 'mobile' กลับเข้ามา =====
type PayMethod = "card" | "mobile" | "qr";

export default function ConfirmScreenRedesigned() {
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const router = useRouter();

  const params = useLocalSearchParams<{ providerId?: string; serviceName?: string; price?: string; duration?: string; }>();
  const providerId = params.providerId || "";
  const serviceName = params.serviceName || "บริการ";
  const priceBaht = Number(params.price) || 0;

  const user = p2pUsers.find((u) => u.id === providerId) || { name: "ไม่พบหมอดู", imageUrl: p2p_user_1 };
  
  const getSelectedPaymentText = () => {
    if (payMethod === 'card') return 'Credit card / Debit card';
    if (payMethod === 'mobile') return 'Mobile Banking';
    return 'QR Thai PromptPay';
  }

  return (
    <ScreenWrapper>
      <HeaderBar title="Payment" showBack onBackPress={() => router.back()} />
      <View className="flex-1 bg-[#0E0B1B]">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}>
          {/* Booking Summary Card */}
          <View className="bg-[#1F1C23] border border-white/10 rounded-2xl p-4 mb-4">
            <Text className="text-white font-bold text-lg mb-3">{user.name}</Text>
            <View className="flex-row items-center">
              <Image source={user.imageUrl} className="w-16 h-16 rounded-lg" />
              <View className="flex-1 ml-4">
                <Text className="text-white/90">Start 12 / 10 / 2568 Time 16:00-16:30</Text>
                <Text className="text-white/70 mt-1">{serviceName}</Text>
                <Text className="text-yellow-400 font-bold mt-1">฿ {priceBaht.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Voucher Code */}
          <View className="bg-[#1F1C23] border border-white/10 rounded-2xl p-3 flex-row items-center mb-4">
            <Text className="text-yellow-400 mr-3">🎟️</Text>
            <TextInput
              placeholder="Enter Voucher Code"
              placeholderTextColor="#8A8A8A"
              className="flex-1 text-white"
            />
            <TouchableOpacity className="bg-purple-600 px-4 py-2 rounded-lg">
              <Text className="text-white font-bold text-sm">Add</Text>
            </TouchableOpacity>
          </View>

          {/* Total Price */}
          <View className="bg-[#1F1C23] border border-white/10 rounded-2xl px-4 py-3 flex-row justify-between items-center mb-6">
            <Text className="text-white font-bold">Total Price</Text>
            <Text className="text-white font-bold text-lg">{priceBaht.toFixed(2)} Baht</Text>
          </View>

          {/* Payment Methods */}
          <View className="bg-[#1F1C23] border border-white/10 rounded-2xl p-4">
            <Text className="text-white font-bold text-base mb-4">Payment Methods</Text>
            
            {/* ===== แก้ไข: ทำให้เป็นตัวเลือกธรรมดา ไม่มีรายละเอียดข้างใน ===== */}
            <PaymentRadioItem label="Credit card / Debit card" selected={payMethod === 'card'} onPress={() => setPayMethod('card')} />
            <PaymentRadioItem label="Mobile Banking" selected={payMethod === 'mobile'} onPress={() => setPayMethod('mobile')} />
            <PaymentRadioItem label="QR Thai PromptPay" selected={payMethod === 'qr'} onPress={() => setPayMethod('qr')} />

          </View>
        </ScrollView>

        {/* --- Bottom Confirm Bar --- */}
        <View className="absolute bottom-0 left-0 right-0 bg-[#1F1C23] border-t border-white/10 p-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white/60 text-xs">Payment Method</Text>
            <Text className="text-white font-bold">{getSelectedPaymentText()}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-xl mr-4">฿{priceBaht.toFixed(2)}</Text>
            <TouchableOpacity className="bg-purple-600 px-8 py-3 rounded-xl active:bg-purple-700">
              <Text className="text-white font-bold text-base">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ===== Sub-components (แก้ไข: เอา children ออก) =====
const PaymentRadioItem = ({ label, selected, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="flex-row items-center py-3">
    <RadioCircle selected={selected} />
    <Text className="text-white/90 ml-4">{label}</Text>
  </TouchableOpacity>
);

const RadioCircle = ({ selected }: { selected: boolean }) => (
  <View className="w-5 h-5 rounded-full border-2 border-purple-400 items-center justify-center">
    {selected && <View className="w-2.5 h-2.5 rounded-full bg-purple-400" />}
  </View>
);