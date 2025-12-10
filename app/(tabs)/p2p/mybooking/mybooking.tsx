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
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const getBaseURL = () =>
  Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";

const formatDateOnlyTH = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace("วัน", "");

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

type BookingStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
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
  FortuneTellerUserID?: string;
};

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
  onCancel,
}: {
  b: Booking;
  onReview: () => void;
  onChat: () => void;
  onCancel: () => void;
}) => {
  const now = new Date();
  const start = new Date(b.StartTime);
  const end = new Date(b.EndTime);
  const canReview = now >= end;
  const canCancel = now < start && b.Status !== "CANCELLED";

  return (
    <View className="bg-[#211A3A] rounded-3xl border border-white/10 mb-4 overflow-hidden p-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-yellow-400 mr-2 items-center justify-center">
            <MaterialIcons name="person" size={20} color="#000" />
          </View>
          <Text className="text-white font-semibold text-base">
            {b.FortuneTellerName}
          </Text>
        </View>

        <View className="items-end">
          {b.Status === "UPCOMING" && (
            <View className="bg-yellow-400/20 px-3 py-1 rounded-full">
              <Text className="text-yellow-300 font-bold text-xs">
                🔸 กำลังจะมาถึง
              </Text>
            </View>
          )}
          {b.Status === "ONGOING" && (
            <View className="bg-green-400/20 px-3 py-1 rounded-full">
              <Text className="text-green-400 font-bold text-xs">
                🟢 กำลังดำเนินการ
              </Text>
            </View>
          )}
          {b.Status === "COMPLETED" && (
            <View className="bg-blue-400/20 px-3 py-1 rounded-full">
              <Text className="text-blue-300 font-bold text-xs">🔵 เสร็จสิ้น</Text>
            </View>
          )}
          {b.Status === "CANCELLED" && (
            <View className="bg-red-400/20 px-3 py-1 rounded-full">
              <Text className="text-red-400 font-bold text-xs">🔴 ยกเลิกแล้ว</Text>
            </View>
          )}
        </View>
      </View>


      <View className="flex-row">
        <Image
          source={{
            uri:
              b.AvatarURL ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          }}
          className="w-28 h-28 rounded-2xl mr-3"
        />
        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">
            {b.ServiceName}
          </Text>

          <Text className="text-yellow-400 font-bold mt-1 text-lg">
            {formatDateOnlyTH(b.StartTime)}
          </Text>
          <Text className="text-white/90 text-base mt-1">
            {formatTimeRange(b.StartTime, b.EndTime)}
          </Text>

          <Text className="text-white/70 text-sm mt-1">
            ฿ {b.Price.toFixed(2)}
          </Text>
        </View>
      </View>

      

      <View className="h-[1px] bg-white/10 w-full my-3" />

      <View className="flex-row flex-wrap">
        <TouchableOpacity
          onPress={onChat}
          className="flex-1 mr-3 px-4 py-3 rounded-full border border-yellow-400 items-center justify-center flex-row mb-2"
        >
          <MaterialIcons
            name="chat-bubble-outline"
            size={18}
            color="#FDE68A"
            style={{ marginRight: 6 }}
          />
          <Text className="text-yellow-400 font-bold text-base">แชต</Text>
        </TouchableOpacity>

        {canReview && (
          <TouchableOpacity
            onPress={onReview}
            className="flex-1 mr-3 px-4 py-3 rounded-full border border-green-500 items-center justify-center flex-row mb-2"
          >
            <MaterialIcons
              name="star-rate"
              size={18}
              color="#4ADE80"
              style={{ marginRight: 6 }}
            />
            <Text className="text-green-400 font-bold text-base">รีวิว</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 px-4 py-3 rounded-full border border-red-500 items-center justify-center flex-row mb-2"
          >
            <MaterialIcons
              name="cancel"
              size={18}
              color="#F87171"
              style={{ marginRight: 6 }}
            />
            <Text className="text-red-400 font-bold text-base">ยกเลิก</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function MyBookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<
    "ALL" | "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "TODAY"
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

      const combined = ordersRes.data
        .map((order: any) => {
          const svc = services.find(
            (s: any) => s.ServiceID === order.ServiceID
          );

          let status: BookingStatus = "UPCOMING";
          const start = new Date(order.StartTime).getTime();
          const end = new Date(order.EndTime).getTime();

          if (order.Status === "CANCELLED") status = "CANCELLED";
          else if (now >= start && now <= end) status = "ONGOING";
          else if (now > end) status = "COMPLETED";

          return {
            ...order,
            AvatarURL: svc?.ImageURLs?.[0] || null,
            Status: status,
            FortuneTellerUserID: svc?.FortuneTeller?.UserID,
          };
        })
        .sort(
          (a: Booking, b: Booking) =>
            new Date(b.StartTime).getTime() - new Date(a.StartTime).getTime()
        );

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
    if (filter === "TODAY") {
      const today = new Date().toDateString();
      return bookings.filter(
        (b) =>
          new Date(b.StartTime).toDateString() === today ||
          new Date(b.EndTime).toDateString() === today
      );
    }
    return bookings.filter((b) => b.Status === filter);
  }, [bookings, filter]);

  const onChat = async (b: Booking) => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return Alert.alert("โปรดเข้าสู่ระบบก่อน");

      const chatRes = await axios.get(`${getBaseURL()}/chat-conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const conversation = (chatRes.data || []).find((conv: any) =>
        conv.Participants?.some((p: any) => p.UserID === b.FortuneTellerUserID)
      );

      if (conversation) {
        router.push({
          pathname: "/chat/chat_screen",
          params: { chatId: conversation.ConversationID },
        });
      } else {
        Alert.alert("ไม่พบห้องแชต", "ยังไม่มีการสนทนากับหมอดูคนนี้");
      }
    } catch (err) {
      console.log("Chat open error:", err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเปิดแชตได้");
    }
  };

  const onCancel = async (b: Booking) => {
    Alert.alert("ยืนยันการยกเลิก", "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ยืนยัน",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync("access_token");
            await axios.delete(`${getBaseURL()}/orders/${b.OrderID}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("สำเร็จ", "ยกเลิกการจองเรียบร้อยแล้ว");
            fetchData();
          } catch (err) {
            console.log("Cancel error:", err);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถยกเลิกการจองได้");
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <ScreenWrapper>
        <HeaderBar
          title="การจองของฉัน"
          showBack
          onBackPress={() => router.back()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white/70 mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <HeaderBar title="การจองของฉัน" showBack />

      {/* ฟิลเตอร์แบบเลื่อนขวาได้ */}
      <View className="px-4 pt-2 pb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row flex-nowrap">
            <PillFilter label="ทั้งหมด" active={filter === "ALL"} onPress={() => setFilter("ALL")} />
            <PillFilter label="วันนี้" active={filter === "TODAY"} onPress={() => setFilter("TODAY")} />
            <PillFilter label="กำลังจะมาถึง" active={filter === "UPCOMING"} onPress={() => setFilter("UPCOMING")} />
            <PillFilter label="กำลังดำเนินการ" active={filter === "ONGOING"} onPress={() => setFilter("ONGOING")} />
            <PillFilter label="เสร็จสิ้น" active={filter === "COMPLETED"} onPress={() => setFilter("COMPLETED")} />
            <PillFilter label="ยกเลิกแล้ว" active={filter === "CANCELLED"} onPress={() => setFilter("CANCELLED")} />
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.OrderID}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <BookingCard
            b={item}
            onChat={() => onChat(item)}
            onReview={() =>
              router.push({
                pathname: "/review",
                params: { serviceId: item.ServiceID },
              })
            }
            onCancel={() => onCancel(item)}
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
