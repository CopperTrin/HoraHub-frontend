import React, { useMemo, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  ImageSourcePropType, Alert
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
  type?: "like" | "comment" | "mention" | "system";
};

const COLORS = {
  bg: "#140E25",
  rowBg: "transparent",
  text: "#E9E7EF",
  dim: "#A7A3B6",
  yellow: "#FFD33D",
  divider: "rgba(255,255,255,0.08)",
  unreadDot: "#5BA7FF",
  danger: "#FF5B5B",
};

const INITIAL_DATA: Noti[] = [
  { id:"1", avatar: fortune_teller_1, title:"หมอช้าง", message:"อีก 10 นาทีมีนัดดูดวงนะครับ", time:"1 วัน", unread:true,  type:"like" },
  { id:"2", avatar: fortune_teller_2, title:"หมอลักษณ์", message:"กล่าวถึงคุณและผู้ติดตามคนอื่นๆ ในความคิดเห็น", time:"16 ชั่วโมง", unread:false, type:"mention" },
  { id:"3", avatar: fortune_teller_3, title:"หมอไนท์ เชื่อมจิต", message:"ดูดวงวันเกิดกำลังจะเริ่ม", time:"17 ชั่วโมง", unread:true,  type:"comment" },
  { id:"4", avatar: fortune_teller_4, title:"หมอปลาย พรายกระซิบ", message:"โพสต์คลิป Reels ใหม่:", time:"2 วัน", unread:false, type:"system" },
];

export default function NotificationsPage() {
  const insets = useSafeAreaInsets();
  const TABBAR_H = 64; // ปรับถ้าของคุณสูง/ต่ำกว่านี้

  const [tab, setTab] = useState<"all"|"unread">("all");
  const [items, setItems] = useState<Noti[]>(INITIAL_DATA);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const list = useMemo(() => (tab === "all" ? items : items.filter(n => n.unread)), [tab, items]);
  const isSelected = (id: string) => selectedIds.has(id);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSelectAll = () => {
    const idsInView = list.map(n => n.id);
    const allSelected = idsInView.every(id => selectedIds.has(id));
    setSelectedIds(new Set(allSelected ? [] : idsInView));
  };

  const markRead = (makeRead: boolean) => {
    setItems(curr =>
      curr.map(n => (selectedIds.has(n.id) ? { ...n, unread: !makeRead } : n))
    );
    clearSelection();
    setSelectMode(false);
  };

  const confirmRemoveSelected = () => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      "ยืนยันการลบ",
      `ต้องการลบ ${selectedIds.size} รายการหรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: () => {
            setItems(curr => curr.filter(n => !selectedIds.has(n.id)));
            clearSelection();
            setSelectMode(false);
          },
        },
      ]
    );
  };

  const Row = ({ item }: { item: Noti }) => {
    const selected = isSelected(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-row items-center px-4 py-3"
        style={{ backgroundColor: selectMode && selected ? "rgba(255,211,61,0.08)" : COLORS.rowBg }}
        onPress={() => (selectMode ? toggleSelect(item.id) : undefined)}
        onLongPress={() => { if (!selectMode) setSelectMode(true); toggleSelect(item.id); }}
      >
        {selectMode ? (
          <TouchableOpacity
            onPress={() => toggleSelect(item.id)}
            className="mr-3 items-center justify-center"
            style={{
              width: 24, height: 24, borderRadius: 12,
              borderWidth: 2, borderColor: selected ? COLORS.yellow : "rgba(255,255,255,0.25)"
            }}
          >
            {selected && (
              <View style={{
                width: 16, height: 16, borderRadius: 8,
                backgroundColor: COLORS.yellow, alignItems: "center", justifyContent: "center"
              }}>
                <Text style={{ color: "#1b1400", fontWeight: "900", fontSize: 12 }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 0, marginRight: 3 }} />
        )}

        <View className="mr-3 relative" style={{ width: 52 }}>
          <Image source={item.avatar} style={{ width: 48, height: 48, borderRadius: 24 }} />
          {item.type && (
            <View
              className="absolute items-center justify-center rounded-full"
              style={{ right: -2, bottom: -2, width: 22, height: 22, backgroundColor: COLORS.yellow }}
            >
              <Text style={{ color: "#1b1400", fontWeight: "800", fontSize: 12 }}>
                {item.type==="like"?"★":item.type==="comment"?"✎":item.type==="mention"?"@":"•"}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-[16px] font-extrabold" style={{ color: COLORS.text }}>{item.title}</Text>
          <Text numberOfLines={2} className="mt-0.5 text-[14px]" style={{ color: COLORS.dim }}>{item.message}</Text>
          <Text className="mt-1 text-[12px]" style={{ color: COLORS.dim }}>{item.time}</Text>
        </View>

        {!selectMode && item.unread && (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.unreadDot }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <HeaderBar title="Notifications" showChat />

      <View className="flex-1" style={{ backgroundColor: COLORS.bg }}>
        <View className="flex-row items-center justify-between px-4 pt-2 pb-2">
          <View className="flex-row gap-2">
            <Tab label="ทั้งหมด" active={tab==="all"} onPress={()=>setTab("all")} />
            <Tab label="ยังไม่ได้อ่าน" active={tab==="unread"} onPress={()=>setTab("unread")} />
          </View>

          <TouchableOpacity
            onPress={() => { if (selectMode) { clearSelection(); } setSelectMode(s => !s); }}
            className="px-3 py-2 rounded-full border"
            style={{ borderColor: selectMode ? COLORS.yellow : "rgba(255,255,255,0.06)", backgroundColor: selectMode ? "rgba(255,211,61,0.12)" : "transparent" }}
          >
            <Text style={{ color: COLORS.yellow, fontWeight: "800" }}>{selectMode ? "ยกเลิก" : "เลือก"}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={list}
          keyExtractor={(i)=>i.id}
          renderItem={({item}) => <Row item={item} />}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: COLORS.divider, marginLeft: selectMode ? 100 : 72 }} />
          )}
          // กันชนเผื่อแถบล่าง + safe area + tabbar
          contentContainerStyle={{ paddingBottom: selectMode ? (insets.bottom + TABBAR_H + 96) : (insets.bottom + 16) }}
          ListHeaderComponent={<View style={{ height: 8 }} />}
        />
      </View>

      {selectMode && (
  <View
    pointerEvents="box-none"
    style={{
      position: "absolute",
      left: 12,
      right: 12,
      bottom: insets.bottom + TABBAR_H + 12,
      zIndex: 50,
      elevation: 0,               // ❌ ไม่ต้องมีเงาที่คอนเทนเนอร์
      backgroundColor: "transparent", // ✅ โปร่งใส
    }}
  >
    <View className="flex-row items-center justify-between mb-2 px-1">
      <Text style={{ color: COLORS.dim }}>
        เลือกแล้ว {selectedIds.size} รายการ
      </Text>
      <TouchableOpacity onPress={toggleSelectAll}>
        <Text style={{ color: COLORS.yellow, fontWeight: "800" }}>
          เลือกทั้งหมด
        </Text>
      </TouchableOpacity>
    </View>

    {/* แถวปุ่มลอยตัว ไม่มีพื้นหลังของแถว */}
    <View style={{ flexDirection: "row", gap: 12 }}>
      <ActionButton label="ทำเป็นอ่านแล้ว" onPress={() => markRead(true)} />
      <ActionButton label="ยังไม่ได้อ่าน" onPress={() => markRead(false)} />
      <ActionButton label="ลบ" danger onPress={confirmRemoveSelected} />
    </View>
  </View>
)}
    </ScreenWrapper>
  );
}

function Tab({ label, active, onPress }:{label:string; active?:boolean; onPress?:()=>void}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}
      className="px-3.5 py-2 rounded-full border"
      style={{ backgroundColor: active? "#FFD33D":"transparent", borderColor: active? "#FFD33D":"rgba(255,255,255,0.06)" }}>
      <Text className="text-[14px] font-bold" style={{ color: active? "#1b1400":"#A7A3B6" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActionButton({ label, onPress, danger }:{label:string; onPress:()=>void; danger?:boolean}) {
  return (
    <TouchableOpacity onPress={onPress}
      className="flex-1 py-3 rounded-lg items-center"
      style={{ backgroundColor: danger ? COLORS.danger : COLORS.yellow }}>
      <Text style={{ color: danger ? "#fff" : "#1b1400", fontWeight: "800" }}>{label}</Text>
    </TouchableOpacity>
  );
}
