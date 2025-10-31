// app/(fortune-teller)/booking/index.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from "react-native";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Constants from "expo-constants";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

// -------- API base (ENV -> Expo host -> fallback) --------
function computeApiBase() {
  const fromEnv =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (Constants?.expoConfig as any)?.extra?.API_BASE_URL ||
    (Constants as any)?.manifest2?.extra?.API_BASE_URL;
  if (fromEnv) return String(fromEnv);

  const dbg =
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (dbg && typeof dbg === "string" && dbg.includes(":")) {
    const host = dbg.split(":")[0];
    if (host === "localhost" || host === "127.0.0.1") {
      return Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";
    }
    return `http://${host}:3456`;
  }
  return Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";
}
const API_BASE = computeApiBase();
const ACCESS_TOKEN_KEY = "access_token";

// -------- Types --------
type Category = {
  CategoryID: string;
  Category_name: string;
  Category_type?: string;
};

type Service = {
  ServiceID: string;
  Service_name: string;
  Service_Description?: string | null;
  Price: number;
  ImageURLs?: string[] | null;
  CategoryID: string;
  FortuneTellerID: string;
  Category?: Category;
};

type TimeSlotItem = {
  TimeSlotID: string;
  StartTime: string;
  EndTime: string;
  LockAmount: number;
  Status: "AVAILABLE" | "BOOKED" | "CANCELLED";
  FortuneTellerID: string;
  ServiceID: string;
};

type FortuneTellerMe = {
  FortuneTellerID: string;
  UserID: string;
  Status: string;
};

type BookingCardData = {
  id: string;                 // TimeSlotID
  ServiceID: string;
  ServiceName: string;
  StartTime: string;
  EndTime: string;
  Price: number;
  AvatarURL?: string | null;  // service image
};

// -------- Utils (TH format แบบง่าย) --------
const pad2 = (n: number) => String(n).padStart(2, "0");
function formatDateOnlyTH(iso: string) {
  const d = new Date(iso);
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function formatTimeRange(isoA: string, isoB: string) {
  const a = new Date(isoA);
  const b = new Date(isoB);
  const h1 = pad2(a.getHours()), m1 = pad2(a.getMinutes());
  const h2 = pad2(b.getHours()), m2 = pad2(b.getMinutes());
  return `${h1}:${m1} - ${h2}:${m2}`;
}

// -------- API helper --------
const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------- Row (Booking Card) --------
function BookingRow({
  b,
  onChat,
  onReview,
  canReview,
}: {
  b: BookingCardData;
  onChat: () => void;
  onReview: () => void;
  canReview: boolean;
}) {
  return (
    <View className="bg-[#211A3A] rounded-2xl p-3 border border-white/10 mb-4">
      <View className="flex-row">
        <Image
          source={{ uri: b.AvatarURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png" }}
          className="w-28 h-28 rounded-2xl mr-3"
        />
        <View className="flex-1">
          <Text className="text-white font-semibold text-lg" numberOfLines={1}>
            {b.ServiceName}
          </Text>

          <Text className="text-yellow-400 font-bold mt-1 text-lg">
            {formatDateOnlyTH(b.StartTime)}
          </Text>
          <Text className="text-white/90 text-base mt-1">
            {formatTimeRange(b.StartTime, b.EndTime)}
          </Text>

          <Text className="text-white/70 text-sm mt-1">฿ {b.Price.toFixed(2)}</Text>
        </View>
      </View>

      <View className="h-[1px] bg-white/10 w-full my-3" />

      <View className="flex-row">
        <TouchableOpacity
          onPress={onChat}
          className="flex-1 mr-3 px-4 py-3 rounded-full border border-yellow-400 items-center justify-center flex-row"
        >
          <MaterialIcons name="chat-bubble-outline" size={18} color="#FDE68A" style={{ marginRight: 6 }} />
          <Text className="text-yellow-400 font-bold text-base">แชต</Text>
        </TouchableOpacity>

        {canReview && (
          <TouchableOpacity
            onPress={onReview}
            className="flex-1 px-4 py-3 rounded-full border border-green-500 items-center justify-center flex-row"
          >
            <MaterialIcons name="star-rate" size={18} color="#4ADE80" style={{ marginRight: 6 }} />
            <Text className="text-green-400 font-bold text-base">รีวิว</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// -------- Page --------
export default function FtBookingHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<TimeSlotItem[]>([]);
  const [ft, setFt] = useState<FortuneTellerMe | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ftRes, svcRes, tsRes] = await Promise.all([
        api.get<FortuneTellerMe>("/fortune-teller/me"),
        api.get<Service[]>("/services"),
        api.get<TimeSlotItem[]>("/time-slots/me"),
      ]);

      const myFt = ftRes.data;
      setFt(myFt);

      const myServices = (svcRes.data || []).filter((s) => s.FortuneTellerID === myFt.FortuneTellerID);
      setServices(myServices);

      setSlots(tsRes.data || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "โหลดข้อมูลไม่สำเร็จ";
      Alert.alert("เกิดข้อผิดพลาด", String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // แผนที่ ServiceID -> Service
  const serviceMap = useMemo(() => {
    const map: Record<string, Service> = {};
    services.forEach((s) => (map[s.ServiceID] = s));
    return map;
  }, [services]);

  // เลือกเฉพาะ slot ที่ BOOKED และเป็นของบริการของเรา
  const bookings: BookingCardData[] = useMemo(() => {
    const mine = new Set(services.map((s) => s.ServiceID));
    return (slots || [])
      .filter((t) => t.Status === "BOOKED" && mine.has(t.ServiceID))
      .sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime())
      .map((t) => {
        const svc = serviceMap[t.ServiceID];
        return {
          id: t.TimeSlotID,
          ServiceID: t.ServiceID,
          ServiceName: svc?.Service_name || "บริการ",
          StartTime: t.StartTime,
          EndTime: t.EndTime,
          Price: Number(svc?.Price ?? 0),
          AvatarURL: Array.isArray(svc?.ImageURLs) && svc.ImageURLs.length > 0 ? svc.ImageURLs[0] : null,
        };
      });
  }, [slots, services, serviceMap]);

  const goManageService = () => {
    // ไปหน้า mybooking ตามที่ระบุ
    router.push("/(fortune-teller)/booking/mybooking");
  };

  const onChat = (b: BookingCardData) => {
    Alert.alert("แชต", "ตัวอย่าง: สร้าง/เปิดห้องแชตกับลูกค้าคนนี้ (รอ backend ส่ง customerId มากับ order/slot).");
  };
  const onReview = (_b: BookingCardData) => {
    Alert.alert("รีวิว", "ฝั่งหมอดูมักไม่ต้องรีวิวลูกค้า (ปรับตาม requirement ได้).");
  };

  return (
    <ScreenWrapper>
      <HeaderBar title="Booking (Fortune Teller)" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white/80 mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ListHeaderComponent={
            <View>
              {/* ปุ่มยาวเดียว: Manage Service */}
              <TouchableOpacity
                onPress={goManageService}
                activeOpacity={0.9}
                className="w-full rounded-full bg-yellow-400 items-center justify-center py-4 mb-4"
              >
                <Text className="text-black font-extrabold text-base">Manage Service</Text>
              </TouchableOpacity>

              <Text className="text-white font-bold text-lg mb-2">Customer Bookings</Text>

              {bookings.length === 0 && (
                <View className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                  <Text className="text-white/70">ยังไม่มีการจองจากลูกค้า</Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <BookingRow
              b={item}
              onChat={() => onChat(item)}
              onReview={() => onReview(item)}
              canReview={false}
            />
          )}
        />
      )}
    </ScreenWrapper>
  );
}
