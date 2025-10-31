import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ---------- Helpers ----------
const getBaseURL = () =>
  Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";

const formatDateOnlyTH = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatTimeRange = (start: string, end: string) => {
  const s = new Date(start).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const e = new Date(end).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${s} - ${e}`;
};

// ---------- Types ----------
type BookingStatus = "UPCOMING" | "ONGOING" | "COMPLETED";
type Booking = {
  OrderID: string;
  ServiceID: string;
  ServiceName: string;
  FortuneTellerName: string;
  Price: number;
  StartTime: string;
  EndTime: string;
  AvatarURL?: string;
  Status: BookingStatus;
};

// ---------- UI Components ----------
const PillFilter = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} className="mr-2 mb-2">
    <View
      className={`px-3 py-1.5 rounded-full border ${
        active
          ? "bg-yellow-400 border-yellow-400"
          : "bg-transparent border-yellow-400"
      }`}
    >
      <Text
        className={`text-xs font-bold ${
          active ? "text-black" : "text-yellow-400"
        }`}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const BookingCard = ({
  b,
  onReview,
  onChat,
}: {
  b: Booking;
  onReview: () => void;
  onChat: () => void;
}) => (
  <View className="bg-[#211A3A] rounded-3xl border border-white/10 mb-4 overflow-hidden p-4">
    {/* Header */}
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center">
        <Image
          source={{
            uri:
              b.AvatarURL ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          }}
          className="w-7 h-7 rounded-full mr-2"
        />
        <Text className="text-white font-semibold">{b.FortuneTellerName}</Text>
      </View>
    </View>

    {/* Content */}
    <View className="flex-row">
      <View className="mr-3">
        <Image
          source={{
            uri:
              b.AvatarURL ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          }}
          className="w-28 h-28 rounded-2xl"
        />
      </View>

      <View className="flex-1">
        <Text className="text-white mt-1 font-semibold">{b.ServiceName}</Text>
        <Text className="text-yellow-400 font-bold mt-2">
          {formatDateOnlyTH(b.StartTime)}
        </Text>
        <Text className="text-white/70 text-sm mt-1">
          {formatTimeRange(b.StartTime, b.EndTime)}
        </Text>
        <Text className="text-white/60 text-sm mt-1">
          ฿ {b.Price.toFixed(2)}
        </Text>
      </View>
    </View>

    <View className="h-[1px] bg-white/10 w-full my-3" />

    {/* Buttons */}
    <View className="flex-row">
      <TouchableOpacity
        onPress={onChat}
        className="flex-1 mr-3 px-4 py-3 rounded-full border border-yellow-400 items-center justify-center flex-row"
      >
        <MaterialIcons
          name="chat-bubble-outline"
          size={16}
          color="#FDE68A"
          style={{ marginRight: 6 }}
        />
        <Text className="text-yellow-400 font-bold">Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onReview}
        className="flex-1 px-4 py-3 rounded-full border border-green-500 items-center justify-center flex-row"
      >
        <MaterialIcons
          name="star-rate"
          size={16}
          color="#4ADE80"
          style={{ marginRight: 6 }}
        />
        <Text className="text-green-400 font-bold">Review</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ---------- Page ----------
export default function MyBookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<
    "ALL" | "UPCOMING" | "ONGOING" | "COMPLETED"
  >("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) {
        Alert.alert("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนดูการจอง", [
          { text: "เข้าสู่ระบบ", onPress: () => router.replace("/profile") },
        ]);
        return;
      }

      const [ordersRes, servicesRes] = await Promise.all([
        axios.get(`${getBaseURL()}/orders/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${getBaseURL()}/services`),
      ]);

      const services = servicesRes.data;
      const now = Date.now();

      const combined = ordersRes.data.map((order: any) => {
        const svc = services.find((s: any) => s.ServiceID === order.ServiceID);
        const ftPic =
          svc?.FortuneTeller?.UserInfo?.PictureURL || svc?.ImageURLs?.[0] || null;

        let status: BookingStatus = "UPCOMING";
        const start = new Date(order.StartTime).getTime();
        const end = new Date(order.EndTime).getTime();

        if (now >= start && now <= end) status = "ONGOING";
        else if (now > end) status = "COMPLETED";

        return { ...order, AvatarURL: ftPic, Status: status };
      });

      setBookings(combined);
    } catch (error) {
      console.log("Load error:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลการจองได้");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const filteredBookings = useMemo(() => {
    if (filter === "ALL") return bookings;
    return bookings.filter((b) => b.Status === filter);
  }, [bookings, filter]);

  const onChat = (b: Booking) => {
    Alert.alert("Chat", `เปิดแชทกับ ${b.FortuneTellerName}`);
  };

  if (loading)
    return (
      <ScreenWrapper>
        <HeaderBar title="My Booking" showBack onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white/70 mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <HeaderBar title="My Booking" showBack />

      {/* Filter Tabs */}
      <View className="px-4 pt-2 pb-3">
        <View className="flex-row flex-wrap">
          <PillFilter
            label="All"
            active={filter === "ALL"}
            onPress={() => setFilter("ALL")}
          />
          <PillFilter
            label="Upcoming"
            active={filter === "UPCOMING"}
            onPress={() => setFilter("UPCOMING")}
          />
          <PillFilter
            label="Ongoing"
            active={filter === "ONGOING"}
            onPress={() => setFilter("ONGOING")}
          />
          <PillFilter
            label="Completed"
            active={filter === "COMPLETED"}
            onPress={() => setFilter("COMPLETED")}
          />
        </View>
      </View>

      {/* Booking List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.OrderID}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 24,
          paddingTop: 8,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <BookingCard
            b={item}
            onChat={() => onChat(item)}
            onReview={() =>
              router.push({
                pathname: "/(tabs)/p2p/review",
                params: { serviceId: item.ServiceID },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <Text className="text-white/60">ยังไม่มีรายการจอง</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
