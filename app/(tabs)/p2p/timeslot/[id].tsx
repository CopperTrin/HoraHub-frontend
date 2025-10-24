// app/p2p/timeslot/[id].tsx
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";

// --- Mock images (ใช้รูปเดิมของคุณได้) ---
import p2p_user_1 from "@/assets/images/p2p/ft1.png";
import p2p_user_2 from "@/assets/images/p2p/ft1.png";
import p2p_user_3 from "@/assets/images/p2p/ft1.png";
import p2p_user_4 from "@/assets/images/p2p/ft1.png";

// ===== Types =====
type Slot = {
  id: string;
  providerId: string;
  serviceName: string;
  startTime: Date;
  durationMin: number;
  price: number;
  isBooked: boolean;
};

type Provider = {
  id: string;
  name: string;
  imageUrl: any;
  rating: number;
  reviews: number;
  // บริการที่ “ถนัด”
  specialties: string[];
  about: string;
};

// ===== Mock Providers =====
const providers: Provider[] = [
  { id: "1", name: "Dr.ช้าง ทศพร", imageUrl: p2p_user_1, rating: 4.8, reviews: 251, specialties: ["โหราศาสตร์ไทย", "ไพ่ทาโรต์", "ฮวงจุ้ยบ้าน"], about: "เชี่ยวชาญด้านโหราศาสตร์ไทยและฮวงจุ้ย" },
  { id: "2", name: "Dr.ลักษณ์ ราชสีห์", imageUrl: p2p_user_2, rating: 5.0, reviews: 512, specialties: ["ดูดวงวันเดือนปีเกิด", "ดวงความรัก"], about: "ฟันธง! ชัดเจนทุกคำถามเรื่องดวงชะตา" },
  { id: "3", name: "Dr.ปลาย พรายกระซิบ", imageUrl: p2p_user_3, rating: 4.9, reviews: 330, specialties: ["ดูดวงเบอร์โทรศัพท์", "ไพ่ทาโรต์"], about: "สัมผัสพิเศษ แก้ไขปัญหาด้วยญาณ" },
  { id: "4", name: "Dr.คฑา ชินบัญชร", imageUrl: p2p_user_4, rating: 4.7, reviews: 180, specialties: ["ไพ่ทาโรต์"], about: "ไพ่ยิปซีแม่นยำ พร้อมให้คำปรึกษา" },
];

// ===== Mock Slots =====
const now = new Date();
const addMin = (m: number) => new Date(now.getTime() + m * 60000);

const mockSlots: Slot[] = [
  { id: "s-1", providerId: "1", serviceName: "โหราศาสตร์ไทย", startTime: addMin(30),  durationMin: 30, price: 399, isBooked: false },
  { id: "s-2", providerId: "1", serviceName: "ไพ่ทาโรต์",     startTime: addMin(90),  durationMin: 20, price: 249, isBooked: false },
  { id: "s-3", providerId: "1", serviceName: "ฮวงจุ้ยบ้าน",    startTime: addMin(150), durationMin: 45, price: 699, isBooked: true  },
  { id: "s-4", providerId: "1", serviceName: "ไพ่ทาโรต์",     startTime: addMin(220), durationMin: 30, price: 329, isBooked: false },

  { id: "s-5", providerId: "2", serviceName: "ดูดวงวันเดือนปีเกิด", startTime: addMin(40),  durationMin: 30, price: 420, isBooked: false },
  { id: "s-6", providerId: "2", serviceName: "ดวงความรัก",         startTime: addMin(120), durationMin: 20, price: 280, isBooked: false },

  { id: "s-7", providerId: "3", serviceName: "ดูดวงเบอร์โทรศัพท์", startTime: addMin(25),  durationMin: 20, price: 260, isBooked: false },
  { id: "s-8", providerId: "3", serviceName: "ไพ่ทาโรต์",         startTime: addMin(85),  durationMin: 20, price: 230, isBooked: true  },

  { id: "s-9",  providerId: "4", serviceName: "ไพ่ทาโรต์",      startTime: addMin(35),  durationMin: 15, price: 180, isBooked: false },
  { id: "s-10", providerId: "4", serviceName: "ไพ่ทาโรต์",      startTime: addMin(160), durationMin: 30, price: 320, isBooked: false },
];

// ===== UI utils =====
const fDate = (d: Date) => d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
const fTime = (d: Date) => d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

const ServiceChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mr-2 mb-2">
    <View className={`px-3 py-1.5 rounded-full border ${active ? "bg-yellow-400 border-yellow-400" : "bg-white/10 border-white/15"}`}>
      <Text className={`text-xs font-bold ${active ? "text-black" : "text-white"}`}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const SlotCard = ({ slot, onPress }: { slot: Slot; onPress: () => void }) => {
  const end = new Date(slot.startTime.getTime() + slot.durationMin * 60000);
  const disabled = slot.isBooked;
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.9}
      className={`bg-primary-100 rounded-2xl p-4 mb-3 border border-white/10 ${disabled ? "opacity-50" : ""}`}
    >
      <View className="flex-row justify-between">
        <View className="pr-2">
          <Text className="text-alabaster font-bold">{slot.serviceName}</Text>
          <Text className="text-gray-300 mt-1">📅 {fDate(slot.startTime)}</Text>
          <Text className="text-gray-300">🕒 {fTime(slot.startTime)} - {fTime(end)}</Text>
          <Text className="text-white/60 text-xs mt-1">{slot.durationMin} นาที</Text>
        </View>
        <View className="items-end">
          <Text className="text-yellow-400 font-bold text-lg">฿{slot.price}</Text>
          <View className={`px-2 py-0.5 rounded-full mt-2 border ${disabled ? "bg-red-500/20 border-red-400/50" : "bg-green-500/20 border-green-400/50"}`}>
            <Text className={`text-[10px] font-bold ${disabled ? "text-red-400" : "text-green-400"}`}>
              {disabled ? "จองแล้ว" : "ว่าง"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ===== Page =====
export default function P2pTimeSlotsPage() {
  const router = useRouter();
  const { id = "", serviceName = "" } = useLocalSearchParams<{ id?: string; serviceName?: string }>();

  const provider = providers.find((p) => p.id === id);
  const specialties = provider?.specialties ?? [];

  // ค่าเริ่ม: ถ้ามี serviceName จาก params ให้เลือกไว้ก่อน ไม่งั้นค่าว่าง (แสดงทุกบริการ)
  const [selectedService, setSelectedService] = useState<string>(serviceName || "");

  // สล๊อตของหมอดู + กรองตามบริการ (ถ้าเลือก)
  const slots = useMemo(() => {
    let list = mockSlots.filter((s) => s.providerId === id);
    if (selectedService) list = list.filter((s) => s.serviceName === selectedService);
    return list.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [id, selectedService]);

  const onPickSlot = (slot: Slot) => {
    const end = new Date(slot.startTime.getTime() + slot.durationMin * 60000);
    router.push({
      pathname: "/(tabs)/p2p/confirm", // ปรับปลายทางให้ตรงโปรเจ็กต์จริง
      params: {
        providerId: slot.providerId,
        slotId: slot.id,
        serviceName: slot.serviceName,
        price: String(slot.price),
        durationMin: String(slot.durationMin),
        startISO: slot.startTime.toISOString(),
        endISO: end.toISOString(),
      },
    });
  };

  if (!provider) {
    return (
      <ScreenWrapper>
        <HeaderBar title="ไม่พบหมอดู" showBack onBackPress={() => router.back()} />
        <View className="p-6">
          <Text className="text-white/70">ไม่พบข้อมูลหมอดู</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title={provider.name} showBack onBackPress={() => router.back()} showChat />
      <ScrollView className="bg-primary-200" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero / รูปหมอดู */}
        <Image source={provider.imageUrl} className="w-full h-72" resizeMode="cover" />

        <View className="p-4">
          {/* ชื่อ + เรตติ้ง */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-2xl font-bold">{provider.name}</Text>
            <Text className="text-yellow-400 font-semibold">⭐ {provider.rating.toFixed(1)} <Text className="text-white/50 text-xs">({provider.reviews})</Text></Text>
          </View>

          {/* กล่องเล็ก “เลือกบริการที่ถนัด” (ไม่ใช่ฟิลเตอร์ข้ามลิสต์) */}
          <View className="bg-primary-100 p-4 rounded-xl border border-white/10 mb-8">
            <Text className="text-white/80 font-semibold mb-3">เลือกบริการ</Text>
            <View className="flex-row flex-wrap">
              {/* ปุ่ม “ทั้งหมด” */}
              <ServiceChip label="ทั้งหมด" active={selectedService === ""} onPress={() => setSelectedService("")} />
              {specialties.map((sp) => (
                <ServiceChip
                  key={sp}
                  label={sp}
                  active={selectedService === sp}
                  onPress={() => setSelectedService(sp)}
                />
              ))}
            </View>
          </View>

          {/* รายการ Time Slot */}
          <Text className="text-white/80 font-bold mb-3">ช่วงเวลาที่ว่าง</Text>
          {slots.length === 0 ? (
            <View className="bg-primary-100/40 p-6 rounded-2xl border border-white/10">
              <Text className="text-white/60">
                {selectedService ? "ยังไม่มีเวลาสำหรับบริการนี้" : "ยังไม่มีช่วงเวลาที่ว่าง"}
              </Text>
            </View>
          ) : (
            slots.map((s) => <SlotCard key={s.id} slot={s} onPress={() => onPickSlot(s)} />)
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
