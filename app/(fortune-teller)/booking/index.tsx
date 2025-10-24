import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";

// ===== Types =====
type ServiceCategory = { id: string; name: string };
type TimeSlot = {
  id: string;
  startTime: Date;
  endTime: Date;
  serviceName: string;
  price: number;
  status: "AVAILABLE" | "BOOKED" | "CANCELLED";
};

// ===== Mock Data =====
const myServices: ServiceCategory[] = [
  { id: "service-uuid-001", name: "ไพ่ทาโรต์" },
  { id: "service-uuid-002", name: "โหราศาสตร์ไทย" },
  { id: "service-uuid-003", name: "ดูดวงเบอร์โทรศัพท์" },
];

const mockTimeSlots: TimeSlot[] = [
  { id: "slot-uuid-101", startTime: new Date("2025-10-12T16:00:00"), endTime: new Date("2025-10-12T16:30:00"), serviceName: "ไพ่ทาโรต์", price: 300, status: "AVAILABLE" },
  { id: "slot-uuid-102", startTime: new Date("2025-10-12T17:00:00"), endTime: new Date("2025-10-12T17:15:00"), serviceName: "ไพ่ทาโรต์", price: 200, status: "BOOKED" },
  { id: "slot-uuid-103", startTime: new Date("2025-10-13T10:00:00"), endTime: new Date("2025-10-13T10:30:00"), serviceName: "โหราศาสตร์ไทย", price: 450, status: "AVAILABLE" },
  { id: "slot-uuid-104", startTime: new Date("2025-10-13T11:00:00"), endTime: new Date("2025-10-13T11:20:00"), serviceName: "ดูดวงเบอร์โทรศัพท์", price: 250, status: "CANCELLED" },
];

// ===== UI pieces =====
const ServiceCard = ({ service, onPress }: { service: ServiceCategory; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className="bg-primary-100 rounded-2xl p-4 mb-3 border border-white/10"
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-alabaster font-bold text-base">{service.name}</Text>
        <Text className="text-white/60 mt-1">แตะเพื่อเลือกวัน/เวลาให้บริการนี้</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color="white" />
    </View>
  </TouchableOpacity>
);

const TimeSlotCard = ({ slot }: { slot: TimeSlot }) => {
  const formatDate = (d: Date) =>
    d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  const statusStyles = {
    AVAILABLE: { text: "ว่าง", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-400/50" },
    BOOKED: { text: "จองแล้ว", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-400/50" },
    CANCELLED: { text: "ยกเลิก", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-400/50" },
  } as const;
  const s = statusStyles[slot.status];

  return (
    <View className="bg-primary-100 rounded-2xl p-4 mb-3 border border-white/10">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-2">
          <Text className="text-alabaster font-bold text-base">{slot.serviceName}</Text>
          <Text className="text-gray-300 mt-1">📅 {formatDate(slot.startTime)}</Text>
          <Text className="text-gray-300">🕒 {formatTime(slot.startTime)} - {formatTime(slot.endTime)}</Text>
        </View>
        <View className="items-end">
          <Text className="text-yellow-400 text-lg font-bold">฿{slot.price}</Text>
          <View className={`px-2 py-1 rounded-full mt-2 border ${s.bg} ${s.border}`}>
            <Text className={`text-xs font-bold ${s.color}`}>{s.text}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ===== Page =====
export default function BookingDashboardPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    setServices(myServices);
    setTimeSlots(mockTimeSlots);
  }, []);

  return (
    <ScreenWrapper>
      <HeaderBar title="P2P Booking" showChat />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8 }}>
        {/* ปุ่มสร้าง Service */}
        <TouchableOpacity
          className="bg-primary-100 flex-row items-center justify-between rounded-full px-5 py-4 mb-6"
          onPress={() => router.push("/(fortune-teller)/booking/service")}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="add-box" size={20} color="white" />
            <Text className="text-alabaster text-base font-semibold ml-3">Create new service</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="white" />
        </TouchableOpacity>

        {/* รายการบริการ */}
        <Text className="text-white/80 font-bold mb-3 text-base">บริการของคุณ</Text>
        {services.length > 0 ? (
          services.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              onPress={() =>
                router.push({
                  pathname: "/(fortune-teller)/booking/[id]",
                  params: {
                    id: "new",
                    serviceId: svc.id,
                    serviceName: svc.name,
                  },
                })
              }
            />
          ))
        ) : (
          <View className="items-center justify-center bg-primary-100/50 p-6 rounded-2xl mb-6">
            <Text className="text-white/60">คุณยังไม่มีบริการที่สร้างไว้</Text>
          </View>
        )}

        {/* ===== ตารางเวลาที่เปิดรับ (จากหน้าเก่า) ===== */}
        <Text className="text-white/80 font-bold mt-4 mb-3 text-base">ตารางเวลาของคุณ</Text>
        {timeSlots.length > 0 ? (
          timeSlots.map((slot) => <TimeSlotCard key={slot.id} slot={slot} />)
        ) : (
          <View className="items-center justify-center bg-primary-100/50 p-6 rounded-2xl">
            <Text className="text-white/60">คุณยังไม่มีตารางเวลาที่เปิดรับ</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
