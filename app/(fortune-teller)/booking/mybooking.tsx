// app/(fortune-teller)/booking/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";

// ==============================
// Types (UI)
// ==============================
type ServiceCategory = { id: string; name: string };

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
    UserID: string;
    Status: "ACTIVE" | "PENDING" | "REJECTED";
  };
};

type TimeSlotItem = {
  TimeSlotID: string;
  StartTime: string;
  EndTime: string;
  LockAmount: number;
  Status?: string;
  FortuneTellerID: string;
  ServiceID: string;
};

// ==============================
// Axios instance
// ==============================
const ACCESS_TOKEN_KEY = "access_token";

const computeBaseURL = () => {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env;
  // Emulator-friendly fallback
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
        <Text className="text-white/60 mt-1">create time slot/edit service </Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color="white" />
    </View>
  </TouchableOpacity>
);

// ==============================
// Page
// ==============================
export default function BookingDashboardPage() {
  const router = useRouter();

  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingOnce, setLoadingOnce] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      // 1) ใครฉัน?
      const meRes = await api.get<UserProfile>("/users/profile");
      const myUserId = meRes.data.UserID;

      // 2) ดึง services แล้วกรองเฉพาะของฉัน
      const servicesRes = await api.get<ServiceItem[]>("/services");
      const mine = (servicesRes.data || []).filter(
        (s) => s.FortuneTeller?.UserID === myUserId
      );

      // Map เป็น ServiceCategory[]
      const myServiceList: ServiceCategory[] = mine.map((s) => ({
        id: s.ServiceID,
        name: s.Service_name,
      }));

      setServices(myServiceList);
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

  // รีโหลดเมื่อโฟกัส
  useFocusEffect(
    useCallback(() => {
      fetchAll();
      return () => {};
    }, [fetchAll])
  );

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
      <HeaderBar title="P2P Booking" showChat showBack />

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
        <Text className="text-white/80 font-bold mb-3 text-base">Your service</Text>
        {services.length > 0 ? (
          services.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              onPress={() =>
                router.push({
                  pathname: "/(fortune-teller)/booking/service/[id]",
                  params: { id: svc.id },
                })
              }
            />
          ))
        ) : (
          <View className="items-center justify-center bg-primary-100/50 p-6 rounded-2xl mb-6">
            <Text className="text-white/60">คุณยังไม่มีบริการที่สร้างไว้</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
