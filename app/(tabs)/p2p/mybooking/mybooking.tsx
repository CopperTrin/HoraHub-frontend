// app/(tabs)/p2p/mybooking/mybooking.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import { MaterialIcons } from "@expo/vector-icons"; // ✅ ใช้ Material Icons

// ---------- Types ----------
type BookingStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";
type Booking = {
  OrderID: string;
  ServiceID: string;
  ServiceName: string;
  FortuneTellerID: string;
  FortuneTellerName: string;
  FortuneTellerAvatar?: string;
  StartTime: string; // ISO
  EndTime: string;   // ISO
  Price: number;
  Status: BookingStatus;
};

// ---------- Mock Data ----------
const MOCK_BOOKINGS: Booking[] = [
  {
    OrderID: "ORD-1001",
    ServiceID: "35418608-8652-4ca4-87a4-e3c476cd1782",
    ServiceName: "Video call 1 hour",
    FortuneTellerID: "cfb9-...4553",
    FortuneTellerName: "หมอปลาย",
    FortuneTellerAvatar:
      "https://lh3.googleusercontent.com/a/ACg8ocL-IjS46ve74guO46SIMgq-Sw7r7-yOQRjmupbcpNmMY9OU1Og=s96-c",
    StartTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    EndTime: new Date(Date.now() + 85 * 60 * 1000).toISOString(),
    Price: 1500,
    Status: "UPCOMING",
  },
  {
    OrderID: "ORD-1002",
    ServiceID: "d613b2b5-dce2-42f4-9e14-d719ffe4560c",
    ServiceName: "Vidio call 30 Min",
    FortuneTellerID: "cfb9-...4553",
    FortuneTellerName: "หมอลักษณ์",
    FortuneTellerAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400",
    StartTime: new Date(Date.now() + 58 * 60 * 1000).toISOString(),
    EndTime: new Date(Date.now() + 88 * 60 * 1000).toISOString(),
    Price: 299,
    Status: "UPCOMING",
  },
];

// ---------- Helpers ----------
const formatDateOnlyTH = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const minsUntil = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 60000));
};

const STATUS_STYLE: Record<
  BookingStatus,
  { text: string; badge: string; textColor: string; border: string }
> = {
  UPCOMING: {
    text: "รอเข้าดูดวง",
    badge: "bg-yellow-500/20",
    textColor: "text-yellow-300",
    border: "border-yellow-400/50",
  },
  COMPLETED: {
    text: "เสร็จสิ้น",
    badge: "bg-green-500/20",
    textColor: "text-green-300",
    border: "border-green-400/50",
  },
  CANCELLED: {
    text: "ยกเลิกแล้ว",
    badge: "bg-red-500/20",
    textColor: "text-red-300",
    border: "border-red-400/50",
  },
};

// ---------- UI Parts ----------
/** ฟิลเตอร์: ขนาดเท่าเดิม (px-3 / py-1.5, text-xs) */
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
      <Text className={`text-xs font-bold ${active ? "text-black" : "text-yellow-400"}`}>
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const BookingCard = ({
  b,
  notifyEnabled,
  onToggleNotify,
  onChat,
  onCancel,
}: {
  b: Booking;
  notifyEnabled: boolean;
  onToggleNotify: () => void;
  onChat: () => void;
  onCancel: () => void;
}) => {
  const startIn = minsUntil(b.StartTime);

  return (
    <View className="bg-[#211A3A] rounded-3xl border border-white/10 mb-4 overflow-hidden p-4">
      {/* header row: ชื่อหมอดู + ไอคอนกระดิ่ง (Material Icons สีขาวล้วน) */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-full bg-white/15 items-center justify-center mr-2">
            <Text className="text-white/90">👤</Text>
          </View>
          <Text className="text-white font-semibold">{b.FortuneTellerName}</Text>
        </View>

        <TouchableOpacity
          onPress={onToggleNotify}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-1"
          accessibilityRole="button"
          accessibilityLabel={notifyEnabled ? "ปิดการแจ้งเตือน" : "เปิดการแจ้งเตือน"}
        >
          <MaterialIcons
            name={notifyEnabled ? "notifications" : "notifications-off"}
            size={20}
            color="#F8F8F8" // ✅ ไอคอนธรรมดา ไม่มีสีพื้น
          />
        </TouchableOpacity>
      </View>

      {/* content row */}
      <View className="flex-row">
        <View className="mr-3">
          {b.FortuneTellerAvatar ? (
            <Image source={{ uri: b.FortuneTellerAvatar }} className="w-28 h-28 rounded-2xl" />
          ) : (
            <View className="w-28 h-28 rounded-2xl bg-white/10" />
          )}
        </View>

        <View className="flex-1">
          <View className="self-start px-3 py-1 rounded-full bg-purple-600">
            <Text className="text-white font-semibold text-xs">{`Start in ${startIn} Minute`}</Text>
          </View>

          <Text className="text-white mt-2" numberOfLines={2}>
            <Text className="font-semibold">{b.ServiceName}</Text> <Text className="text-white/80">x1</Text>
          </Text>

          <Text className="text-yellow-400 font-bold mt-2">
            {formatDateOnlyTH(b.StartTime)}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-white/10 w-full my-3" />

      <View className="flex-row">
        <TouchableOpacity
          onPress={onChat}
          className="flex-1 mr-3 px-4 py-3 rounded-full border border-yellow-400 items-center justify-center flex-row"
          activeOpacity={0.9}
        >
          <MaterialIcons name="chat-bubble-outline" size={16} color="#FDE68A" style={{ marginRight: 6 }} />
          <Text className="text-yellow-400 font-bold">Chat to</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 px-4 py-3 rounded-full border border-red-500 items-center justify-center flex-row"
          activeOpacity={0.9}
        >
          <MaterialIcons name="cancel" size={16} color="#FCA5A5" style={{ marginRight: 6 }} />
          <Text className="text-red-400 font-bold">Cancel booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------- Page ----------
export default function MyBookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"ALL" | "TODAY" | "RATE" | "HISTORY">("ALL");

  // สถานะแจ้งเตือนต่อใบจอง (true = เปิด)
  const [notifyMap, setNotifyMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // init: เปิดแจ้งเตือนทุกอันที่กำลังจะถึง
    const init: Record<string, boolean> = {};
    bookings.forEach((b) => (init[b.OrderID] = b.Status === "UPCOMING"));
    setNotifyMap(init);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const filtered = useMemo(() => {
    let arr = bookings.slice();
    if (tab === "TODAY") {
      const today = new Date().toLocaleDateString("en-CA");
      arr = arr.filter((b) => new Date(b.StartTime).toLocaleDateString("en-CA") === today);
    } else if (tab === "RATE") {
      arr = arr.filter((b) => b.Status === "COMPLETED");
    } else if (tab === "HISTORY") {
      arr = arr.filter((b) => b.Status !== "UPCOMING");
    }
    return arr.sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime());
  }, [bookings, tab]);

  const onChat = (b: Booking) => {
    Alert.alert("Chat", `Start chat ${b.FortuneTellerName}`);
  };

  const onCancel = (b: Booking) => {
    Alert.alert("ยืนยันการยกเลิก", "คุณต้องการยกเลิกการจองนี้หรือไม่?", [
      { text: "ไม่ยกเลิก", style: "cancel" },
      {
        text: "ยกเลิก",
        style: "destructive",
        onPress: () => {
          setBookings((prev) =>
            prev.map((x) => (x.OrderID === b.OrderID ? { ...x, Status: "CANCELLED" } : x))
          );
          setNotifyMap((m) => ({ ...m, [b.OrderID]: false })); // ปิดแจ้งเตือนเมื่อยกเลิก
          Alert.alert("Finish", "Accept your Cancal");
        },
      },
    ]);
  };

  const toggleNotify = (id: string) =>
    setNotifyMap((m) => ({ ...m, [id]: !m[id] }));

  return (
    <ScreenWrapper>
      {/* ไม่แก้ HeaderBar */}
      <HeaderBar title="Mybooking" showBack onBackPress={() => router.back()} />

      {/* แถวฟิลเตอร์: ขนาดเท่าอันเดิม */}
      <View className="px-4 pt-2 pb-3">
        <View className="flex-row flex-wrap">
          <PillFilter label="All"    active={tab === "ALL"}     onPress={() => setTab("ALL")} />
          <PillFilter label="Today"  active={tab === "TODAY"}   onPress={() => setTab("TODAY")} />
          <PillFilter label="Rate"   active={tab === "RATE"}    onPress={() => setTab("RATE")} />
          <PillFilter label="History"active={tab === "HISTORY"} onPress={() => setTab("HISTORY")} />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.OrderID}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <BookingCard
            b={item}
            notifyEnabled={!!notifyMap[item.OrderID]}
            onToggleNotify={() => toggleNotify(item.OrderID)}
            onChat={() => onChat(item)}
            onCancel={() => onCancel(item)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <Text className="text-white/60">ยังไม่มีรายการ</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
