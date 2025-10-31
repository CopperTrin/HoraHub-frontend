import React, { useMemo, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image, ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";

import fortune_teller_1 from "@/assets/images/home/fortune_teller_1.png";
import fortune_teller_2 from "@/assets/images/home/fortune_teller_2.png";
import fortune_teller_3 from "@/assets/images/home/fortune_teller_3.png";
import fortune_teller_4 from "@/assets/images/home/fortune_teller_4.png";

type Noti = {
  id: string;
  avatar: ImageSourcePropType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type?: "booking" | "message" | "system";
};

const COLORS = {
  bg: "#140E25",
  text: "#E9E7EF",
  dim: "#B3A9CC",
  accent: "#D9A6FF",
  divider: "rgba(255,255,255,0.08)",
  unreadDot: "#D9A6FF",
};

const INITIAL_DATA: Noti[] = [
  { id: "1", avatar: fortune_teller_1, title: "ลูกค้า: แพรวา", message: "จองดูดวงเวลา 19:30 น.", time: "5 นาที", unread: true, type: "booking" },
  { id: "2", avatar: fortune_teller_2, title: "ระบบ", message: "มีลูกค้าใหม่เริ่มติดตามคุณ", time: "2 ชั่วโมง", unread: false, type: "system" },
  { id: "3", avatar: fortune_teller_3, title: "ลูกค้า: บอส", message: "ขอเลื่อนนัดเป็นพรุ่งนี้ได้ไหมครับ", time: "1 วัน", unread: true, type: "message" },
  { id: "4", avatar: fortune_teller_4, title: "ระบบ", message: "รีวิวใหม่จากลูกค้า: ⭐⭐⭐⭐⭐", time: "3 วัน", unread: false, type: "system" },
];

export default function NotificationsPage() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<Noti[]>(INITIAL_DATA);

  const list = useMemo(() => (tab === "all" ? items : items.filter(n => n.unread)), [tab, items]);

  const markAllRead = () => {
    setItems(curr => curr.map(n => ({ ...n, unread: false })));
  };

  const Row = ({ item }: { item: Noti }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className="flex-row items-center px-4 py-3"
      style={{ backgroundColor: COLORS.bg }}
      onPress={() => {
        if (item.unread) {
          setItems(curr => curr.map(n => (n.id === item.id ? { ...n, unread: false } : n)));
        }
      }}
    >
      <View className="mr-3 relative" style={{ width: 52 }}>
        <Image source={item.avatar} style={{ width: 48, height: 48, borderRadius: 24 }} />
        {item.type && (
          <View
            className="absolute items-center justify-center rounded-full"
            style={{
              right: -2,
              bottom: -2,
              width: 22,
              height: 22,
              backgroundColor: COLORS.accent,
            }}
          >
            <Text style={{ color: "#1E1336", fontWeight: "800", fontSize: 12 }}>
              {item.type === "booking"
                ? "🕓"
                : item.type === "message"
                ? "💬"
                : "★"}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[16px] font-extrabold" style={{ color: COLORS.text }}>
          {item.title}
        </Text>
        <Text numberOfLines={2} className="mt-0.5 text-[14px]" style={{ color: COLORS.dim }}>
          {item.message}
        </Text>
        <Text className="mt-1 text-[12px]" style={{ color: COLORS.dim }}>
          {item.time}
        </Text>
      </View>

      {item.unread && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: COLORS.unreadDot,
          }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <HeaderBar title="Notification" />

      <View className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        {/* ส่วนหัว */}
        <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
          <View className="flex-row gap-2">
            <Tab label="All" active={tab === "all"} onPress={() => setTab("all")} />
            <Tab label="Not yet" active={tab === "unread"} onPress={() => setTab("unread")} />
          </View>

          <TouchableOpacity onPress={markAllRead}>
          </TouchableOpacity>
        </View>

        {/* รายการแจ้งเตือน */}
        <FlatList
          data={list}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <Row item={item} />}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: COLORS.divider, marginLeft: 72 }} />
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          ListHeaderComponent={<View style={{ height: 8 }} />}
        />
      </View>
    </ScreenWrapper>
  );
}

function Tab({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="px-3.5 py-2 rounded-full border"
      style={{
        backgroundColor: active ? "#D9A6FF" : "transparent",
        borderColor: active ? "#D9A6FF" : "rgba(255,255,255,0.06)",
      }}
    >
      <Text
        className="text-[14px] font-bold"
        style={{ color: active ? "#1E1336" : "#B3A9CC" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
