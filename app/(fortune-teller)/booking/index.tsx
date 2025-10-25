// app/(fortune-teller)/booking/dashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router"; // 👈 เพิ่ม useFocusEffect
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";

// ==============================
// Types (UI)
// ==============================
type ServiceCategory = { id: string; name: string };
type TimeSlot = {
  id: string;
  startTime: Date;
  endTime: Date;
  serviceName: string;
  price: number;
  status: "AVAILABLE" | "BOOKED" | "CANCELLED";
};

// ==============================
// Types (จาก Server — ย่อจาก OAS)
// ==============================
type UserProfile = {
  UserID: string;
  Username: string;
  Role: string[];
  UserInfo?: {
    Email?: string;
    FirstName?: string;
    LastName?: string;
    GoogleID?: string;
    PictureURL?: string;
  };
};

type ServiceItem = {
  ServiceID: string;
  Service_name: string;
  Service_Description: string | null;
  Price: number;
  Avg_Rating: number | null;
  ImageURLs?: string[] | null;
  CategoryID: string;
  FortuneTellerID: string;
  Category?: {
    CategoryID: string;
    Category_name: string;
    Category_type: string;
  };
  FortuneTeller?: {
    FortuneTellerID: string;
    UserID: string; // ใช้กรอง "บริการของฉัน"
    Status: "ACTIVE" | "PENDING" | "REJECTED";
  };
};

type TimeSlotItem = {
  TimeSlotID: string;
  StartTime: string; // ISO
  EndTime: string;   // ISO
  LockAmount: number;
  Status: "AVAILABLE" | "BOOKED" | "CANCELLED";
  FortuneTellerID: string;
  ServiceID: string;
};

// ==============================
// Axios instance (ไฟล์เดียวจบ)
// ==============================
const ACCESS_TOKEN_KEY = "access_token"; // ให้ตรงกับหน้า SignIn เดิมของคุณ

const computeBaseURL = () => {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env;
  // Emulator-friendly fallback:
  // Android Emulator -> 10.0.2.2, iOS Simulator -> localhost
  // ถ้าเป็น device จริงให้ตั้งค่า ENV เป็น IP เครื่อง dev หรือใช้ ngrok
  // @ts-ignore
  const { Platform } = require("react-native");
  if (Platform.OS === "android") return "http://10.0.2.2:3456";
  return "http://localhost:3456";
};

const api = axios.create({
  baseURL: computeBaseURL(),
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==============================
// UI pieces
// ==============================
const ServiceCard = ({
  service,
  onPress,
}: {
  service: ServiceCategory;
  onPress: () => void;
}) => (
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
    d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  const statusStyles = {
    AVAILABLE: {
      text: "ว่าง",
      color: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-400/50",
    },
    BOOKED: {
      text: "จองแล้ว",
      color: "text-yellow-400",
      bg: "bg-yellow-500/20",
      border: "border-yellow-400/50",
    },
    CANCELLED: {
      text: "ยกเลิก",
      color: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-400/50",
    },
  } as const;
  const s = statusStyles[slot.status];

  return (
    <View className="bg-primary-100 rounded-2xl p-4 mb-3 border border-white/10">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-2">
          <Text className="text-alabaster font-bold text-base">
            {slot.serviceName}
          </Text>
          <Text className="text-gray-300 mt-1">📅 {formatDate(slot.startTime)}</Text>
          <Text className="text-gray-300">
            🕒 {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </Text>
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

// ==============================
// Page (ไฟล์เดียวครบ)
// ==============================
export default function BookingDashboardPage() {
  const router = useRouter();

  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingOnce, setLoadingOnce] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      // 1) ใครฉัน? => เอา UserID มาก่อน
      const meRes = await api.get<UserProfile>("/users/profile");
      const myUserId = meRes.data.UserID;

      // 2) ดึง services ทั้งหมด แล้วกรองเฉพาะที่เป็นของฉัน
      const servicesRes = await api.get<ServiceItem[]>("/services");
      const mine = (servicesRes.data || []).filter(
        (s) => s.FortuneTeller?.UserID === myUserId
      );

      // Map เป็น ServiceCategory[] (ใช้ ServiceID/Service_name)
      const myServiceList: ServiceCategory[] = mine.map((s) => ({
        id: s.ServiceID,
        name: s.Service_name,
      }));

      // 3) ดึง time slots ของฉัน
      const tsRes = await api.get<TimeSlotItem[]>("/time-slots/me");
      const myTimeSlotsRaw = tsRes.data || [];

      // สร้าง map service เพื่อง่ายต่อการเติมชื่อ/ราคา
      const byId = new Map(mine.map((s) => [s.ServiceID, s]));

      const myTimeSlots: TimeSlot[] = myTimeSlotsRaw.map((t) => {
        const srv = byId.get(t.ServiceID);
        return {
          id: t.TimeSlotID,
          startTime: new Date(t.StartTime),
          endTime: new Date(t.EndTime),
          serviceName: srv?.Service_name ?? "Unknown Service",
          price: Number(srv?.Price ?? 0),
          status: (t.Status ?? "AVAILABLE") as TimeSlot["status"],
        };
      });

      // เรียงตามเวลาเริ่ม
      myTimeSlots.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );

      setServices(myServiceList);
      setTimeSlots(myTimeSlots);
    } catch (err: any) {
      console.log("Booking dashboard fetch error:", err?.message || err);
      Alert.alert("ดึงข้อมูลไม่สำเร็จ", "โปรดลองใหม่อีกครั้ง");
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  // โหลดครั้งแรก
  useEffect(() => {
    (async () => {
      try {
        await fetchAll();
      } finally {
        setLoadingOnce(false);
      }
    })();
  }, [fetchAll]);

  // 👇 รีโหลดอัตโนมัติทุกครั้งที่หน้านี้ถูกโฟกัส (เช่น กลับมาจากหน้า Create Service)
  useFocusEffect(
    useCallback(() => {
      // refresh แบบเงียบ ไม่ไปยุ่ง loadingOnce
      fetchAll();
      return () => {};
    }, [fetchAll])
  );

  // ------ Render ------
  if (loadingOnce) {
    return (
      <ScreenWrapper>
        <HeaderBar title="P2P Booking" showChat />
        <View className="flex-1 items-center justify-center">
          <Text className="text-white/80">กำลังโหลดข้อมูล...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title="P2P Booking" showChat />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 28,
          paddingTop: 8,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ปุ่มสร้าง Service */}
        <TouchableOpacity
          className="bg-primary-100 flex-row items-center justify-between rounded-full px-5 py-4 mb-6"
          onPress={() => router.push("/(fortune-teller)/booking/create_service")}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="add-box" size={20} color="white" />
            <Text className="text-alabaster text-base font-semibold ml-3">
              Create new service
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="white" />
        </TouchableOpacity>

        {/* บริการของคุณ */}
        <Text className="text-white/80 font-bold mb-3 text-base">
          บริการของคุณ
        </Text>
        {services.length > 0 ? (
          services.map((svc) => (
         <ServiceCard
            key={svc.id}
            service={svc}
            onPress={() =>
              router.push({
                pathname: "/(fortune-teller)/booking/service/[id]",
                params: { id: svc.id }, // 👉 ไปหน้า service detail
              })
            }
          />
          ))
        ) : (
          <View className="items-center justify-center bg-primary-100/50 p-6 rounded-2xl mb-6">
            <Text className="text-white/60">
              คุณยังไม่มีบริการที่สร้างไว้
            </Text>
          </View>
        )}

        {/* ตารางเวลาของคุณ */}
        <Text className="text-white/80 font-bold mt-4 mb-3 text-base">
          ตารางเวลาของคุณ
        </Text>
        {timeSlots.length > 0 ? (
          timeSlots.map((slot) => <TimeSlotCard key={slot.id} slot={slot} />)
        ) : (
          <View className="items-center justify-center bg-primary-100/50 p-6 rounded-2xl">
            <Text className="text-white/60">
              คุณยังไม่มีตารางเวลาที่เปิดรับ
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
