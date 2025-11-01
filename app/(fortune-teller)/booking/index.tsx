import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Constants from "expo-constants";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";


const API_BASE = "https://softdev-horahub-backend-production.up.railway.app";

const ACCESS_TOKEN_KEY = "access_token";

type Service = {
  ServiceID: string;
  Service_name: string;
  Price: number;
  ImageURLs?: string[] | null;
  FortuneTellerID: string;
};

type TimeSlotItem = {
  TimeSlotID: string;
  StartTime: string;
  EndTime: string;
  LockAmount: number;
  Status: string;
  FortuneTellerID: string;
  ServiceID: string;
  Customer?: {
    User?: {
      UserInfo?: {
        FirstName?: string;
        LastName?: string;
        PictureURL?: string;
        Email?: string;
      };
    };
  } | null;
};

type FortuneTellerMe = {
  FortuneTellerID: string;
  UserID: string;
  Status: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
function formatDateOnlyTH(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function formatTimeRange(a: string, b: string) {
  const A = new Date(a),
    B = new Date(b);
  return `${pad2(A.getHours())}:${pad2(A.getMinutes())} - ${pad2(
    B.getHours()
  )}:${pad2(B.getMinutes())}`;
}

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token)
    (config.headers = { ...config.headers, Authorization: `Bearer ${token}` });
  return config;
});

function BookingRow({
  slot,
  onChat,
}: {
  slot: TimeSlotItem & { ServiceName: string; Price: number; AvatarURL?: string | null };
  onChat: () => void;
}) {
const userInfo = slot.CustomerInfo;

  return (
    <View className="bg-[#211A3A] rounded-2xl p-4 border border-white/10 mb-5">
      {userInfo && (
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Image
              source={{
                uri:
                  userInfo?.PictureURL ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png",
              }}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View>
              <Text className="text-white font-bold text-base">
                {userInfo?.FirstName} {userInfo?.LastName}
              </Text>
              <Text className="text-white/60 text-xs">{userInfo?.Email}</Text>
            </View>
          </View>

          <View className="items-end">
            {slot.Status === "BOOKED" && (
              <View className="bg-yellow-400/20 px-3 py-1 rounded-full">
                <Text className="text-yellow-300 font-bold text-xs">
                  🔸 จองแล้ว
                </Text>
              </View>
            )}
            {slot.Status === "ONGOING" && (
              <View className="bg-green-400/20 px-3 py-1 rounded-full">
                <Text className="text-green-400 font-bold text-xs">
                  🟢 กำลังดำเนินการ
                </Text>
              </View>
            )}
            {slot.Status === "COMPLETED" && (
              <View className="bg-blue-400/20 px-3 py-1 rounded-full">
                <Text className="text-blue-300 font-bold text-xs">🔵 เสร็จสิ้น</Text>
              </View>
            )}
            {slot.Status === "CANCELLED" && (
              <View className="bg-red-400/20 px-3 py-1 rounded-full">
                <Text className="text-red-400 font-bold text-xs">🔴 ยกเลิกแล้ว</Text>
              </View>
            )}
          </View>
        </View>

      )}

      <View className="flex-row">
        <Image
          source={{
            uri:
              slot.AvatarURL ||
              "https://cdn-icons-png.flaticon.com/512/4333/4333609.png",
          }}
          className="w-28 h-28 rounded-2xl mr-3"
        />
        <View className="flex-1 justify-center">
          <Text className="text-white font-semibold text-lg">
            {slot.ServiceName}
          </Text>
          <Text className="text-yellow-400 font-bold mt-1 text-lg">
            {formatDateOnlyTH(slot.StartTime)}
          </Text>
          <Text className="text-white/90 text-base mt-1">
            {formatTimeRange(slot.StartTime, slot.EndTime)}
          </Text>
          <Text className="text-white/70 text-sm mt-1">
            ฿ {slot.Price.toFixed(2)}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-white/10 w-full my-3" />

      <TouchableOpacity
        onPress={onChat}
        className="w-full px-4 py-3 rounded-full border border-yellow-400 items-center justify-center flex-row"
      >
        <MaterialIcons
          name="chat-bubble-outline"
          size={18}
          color="#FDE68A"
          style={{ marginRight: 6 }}
        />
        <Text className="text-yellow-400 font-bold text-base">แชต</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function FtBookingHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<TimeSlotItem[]>([]);
  const [ft, setFt] = useState<FortuneTellerMe | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "TODAY" | "UPCOMING" | "PAST">("UPCOMING");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ftRes, svcRes, tsRes, chatRes] = await Promise.all([
        api.get<FortuneTellerMe>("/fortune-teller/me"),
        api.get<Service[]>("/services"),
        api.get<TimeSlotItem[]>("/time-slots/me"),
        api.get("/chat-conversations"),
      ]);

      setFt(ftRes.data);
      const myFt = ftRes.data;
      setServices(
        svcRes.data.filter((s) => s.FortuneTellerID === myFt.FortuneTellerID)
      );
      setSlots(tsRes.data || []);
      setChats(chatRes.data || []);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "โหลดข้อมูลไม่สำเร็จ";
      Alert.alert("เกิดข้อผิดพลาด", String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const serviceMap = useMemo(() => {
    const map: Record<string, Service> = {};
    services.forEach((s) => (map[s.ServiceID] = s));
    return map;
  }, [services]);

const bookings = useMemo(() => {
  const mine = new Set(services.map((s) => s.ServiceID));

  const allBookings = (slots || [])
    .filter(
      (t) =>
        t.Status === "BOOKED" ||
        (t.Orders && t.Orders.length > 0) // มีการจองใน Orders ก็ถือว่ามี booking
    )
    .filter((t) => mine.has(t.ServiceID))
    .map((t) => {
      const svc = serviceMap[t.ServiceID];
      const firstOrder = t.Orders?.[0];
      const customerInfo = firstOrder?.Customer?.User?.UserInfo;

      return {
        ...t,
        CustomerInfo: customerInfo || null,
        ServiceName: svc?.Service_name || "บริการ",
        Price: svc?.Price ?? 0,
        AvatarURL: svc?.ImageURLs?.[0] ?? null,
      };
    });

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  let filtered = allBookings;

  if (filterType === "TODAY") {
    filtered = allBookings.filter((b) => {
      const start = new Date(b.StartTime);
      return start >= startOfDay && start <= endOfDay;
    });
  } else if (filterType === "UPCOMING") {
    filtered = allBookings.filter((b) => new Date(b.StartTime) > now);
  } else if (filterType === "PAST") {
    filtered = allBookings.filter((b) => new Date(b.EndTime) < now);
  }

  return filtered.sort(
    (a, b) =>
      new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime()
  );
}, [slots, services, serviceMap, filterType]);


  const onChat = async (b: any) => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return Alert.alert("โปรดเข้าสู่ระบบก่อน");

      const chatRes = await axios.get(`${API_BASE}/chat-conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const customerEmail = b.CustomerInfo?.Email || "";
      const customerFirstName = b.CustomerInfo?.FirstName || "";
      const customerLastName = b.CustomerInfo?.LastName || "";

      if (!customerEmail && !customerFirstName) {
        return Alert.alert("ไม่พบข้อมูลลูกค้า", "ไม่สามารถเปิดแชตได้เพราะไม่มีข้อมูลลูกค้า");
      }

      const conversation = (chatRes.data || []).find((conv: any) =>
        conv.Participants?.some(
          (p: any) =>
            p.User?.UserInfo?.Email === customerEmail ||
            (p.User?.UserInfo?.FirstName === customerFirstName &&
              p.User?.UserInfo?.LastName === customerLastName)
        )
      );

      if (conversation) {
        router.push({
          pathname: "/chat/chat_screen",
          params: { chatId: conversation.ConversationID },
        });
      } else {
        Alert.alert("ไม่พบห้องแชต", "ยังไม่มีการสนทนากับลูกค้าคนนี้");
      }
    } catch (err) {
      console.log("Chat open error:", err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเปิดแชตได้");
    }
  };

  return (
    <ScreenWrapper>
      <HeaderBar title="การจองของลูกค้า" showChat/>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white/80 mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(it) => it.TimeSlotID}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ListHeaderComponent={
            <View>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(fortune-teller)/booking/mybooking")
                }
                activeOpacity={0.9}
                className="w-full rounded-full bg-yellow-400 items-center justify-center py-4 mb-4"
              >
                <Text className="text-black font-extrabold text-base">
                  Manage Service
                </Text>
              </TouchableOpacity>

              <Text className="text-white font-bold text-lg mb-2">
                รายการจองจากลูกค้า
              </Text>

              <View className="flex-row flex-wrap mb-3">
                {[
                  { key: "UPCOMING", label: "กำลังจะมาถึง" },
                  { key: "TODAY", label: "วันนี้" },
                  { key: "PAST", label: "ผ่านมาแล้ว" },
                  { key: "ALL", label: "ทั้งหมด" },
                ].map((tab) => {
                  const selected = filterType === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setFilterType(tab.key as any)}
                      activeOpacity={0.9}
                      className="mr-2 mb-2"
                    >
                      <View
                        className={`px-3 py-1.5 rounded-full border ${
                          selected
                            ? "bg-yellow-400 border-yellow-400"
                            : "bg-white/10 border-white/20"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            selected ? "text-black" : "text-white"
                          }`}
                        >
                          {tab.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              

              {bookings.length === 0 && (
                <View className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                  <Text className="text-white/70">ยังไม่มีการจองในหมวดนี้</Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <BookingRow slot={item} onChat={() => onChat(item)} />
          )}
        />
      )}
    </ScreenWrapper>
  );
}
