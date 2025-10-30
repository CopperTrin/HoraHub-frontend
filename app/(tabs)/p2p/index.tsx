import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";

// ===== Types =====
type Category = {
  CategoryID: string;
  Category_name: string;
  Category_type: string;
};

type FortuneTeller = {
  FortuneTellerID: string;
  UserID: string;
  Status: string;
  Bio?: string | null;
  CVURL?: string;
};

type User = {
  UserID: string;
  Username: string;
  Role: string[];
  UserInfo?: {
    FirstName: string;
    LastName: string;
    PictureURL?: string;
    Email?: string;
  };
};

type Service = {
  ServiceID: string;
  Service_name: string;
  Service_Description: string;
  Price: number;
  Avg_Rating?: number | null;
  ImageURLs?: string[];
  Category?: Category;
  FortuneTeller?: FortuneTeller;
  FortuneTellerProfile?: User; // เติมตอน merge
};

// ===== Components =====
const CategoryChip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} className="mr-2 mb-2">
    <View
      className={`px-3 py-1.5 rounded-full border ${
        selected ? "bg-yellow-400 border-yellow-400" : "bg-white/10 border-white/20"
      }`}
    >
      <Text className={`text-xs font-bold ${selected ? "text-black" : "text-white"}`}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const ServiceCard = ({
  item,
  onPressCard,
  onPressProfile,
}: {
  item: Service;
  onPressCard: () => void;
  onPressProfile: () => void;
}) => {
  const image = item.ImageURLs?.[0];
  const ft = item.FortuneTellerProfile;
  const ftName = ft
    ? `${ft.UserInfo?.FirstName || ""} ${ft.UserInfo?.LastName || ""}`.trim()
    : "Fortune Teller";

  return (
    <TouchableOpacity
      onPress={onPressCard}
      activeOpacity={0.9}
      className="bg-[#2D2A32] rounded-2xl overflow-hidden border border-white/10 mb-4"
    >
      {image ? (
        <Image source={{ uri: image }} className="w-full h-44" resizeMode="cover" />
      ) : (
        <View className="w-full h-44 items-center justify-center bg-white/5">
          <Text className="text-white/40">ไม่มีรูปภาพ</Text>
        </View>
      )}

      <View className="p-3">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-white font-bold text-base flex-1 pr-2" numberOfLines={1}>
            {item.Service_name}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <View className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
            <Text className="text-[10px] text-white">
              {item.Category?.Category_name || "Uncategorized"}
            </Text>
          </View>
          <Text className="text-yellow-400 font-bold">฿{item.Price}</Text>
        </View>

        <Text className="text-gray-300 text-xs mb-3" numberOfLines={2}>
          {item.Service_Description}
        </Text>

        {/* fortune teller profile area -> กดเพื่อไปหน้าโปรไฟล์ */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressProfile}
          className="flex-row items-center"
        >
          {ft?.UserInfo?.PictureURL ? (
            <Image
              source={{ uri: ft.UserInfo.PictureURL }}
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-white/10 mr-2" />
          )}
          <View className="flex-1">
            <Text className="text-white text-sm font-semibold" numberOfLines={1}>
              {ftName || "ไม่พบชื่อหมอดู"}
            </Text>
            <Text className="text-white/60 text-[11px]" numberOfLines={1}>
              ดูโปรไฟล์หมอดู →
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ===== Page =====
export default function P2PServiceHome() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // กรอง
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState(""); // ✅ เก็บคำค้นจาก HeaderBar

  const API_BASE = "http://localhost:3456";

  // Fetch services + users แล้ว merge
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/services`),
          axios.get(`${API_BASE}/users`),
        ]);

        const serviceList: Service[] = svcRes.data;
        const userList: User[] = userRes.data;

        const merged = serviceList.map((svc) => {
          const ftUser = userList.find((u) => u.UserID === svc.FortuneTeller?.UserID);
          return { ...svc, FortuneTellerProfile: ftUser };
        });

        setServices(merged);
      } catch (err) {
        console.error("โหลด services หรือ users ไม่ได้:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // หมวดหมู่ทั้งหมด
  const categories = useMemo(() => {
    const set = new Set<string>(["ทั้งหมด"]);
    services.forEach((s) => {
      if (s.Category?.Category_name) set.add(s.Category.Category_name);
    });
    return Array.from(set);
  }, [services]);

  // ฟังก์ชันตรวจสอบว่าตรงกับคำค้นไหม (ไม่สนตัวพิมพ์เล็กใหญ่)
  const matchSearch = (item: Service, q: string) => {
    if (!q) return true;
    const needle = q.trim().toLowerCase();

    const ftName = item.FortuneTellerProfile
      ? `${item.FortuneTellerProfile.UserInfo?.FirstName || ""} ${item.FortuneTellerProfile.UserInfo?.LastName || ""}`
      : "";

    const haystacks = [
      item.Service_name,
      item.Service_Description,
      item.Category?.Category_name,
      ftName,
      String(item.Price),
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase());

    return haystacks.some((h) => h.includes(needle));
  };

  // กรองตามหมวดหมู่ + คำค้น
  const filtered = useMemo(() => {
    const byCategory =
      selectedCategory === "ทั้งหมด"
        ? services
        : services.filter((s) => s.Category?.Category_name === selectedCategory);

    return byCategory.filter((s) => matchSearch(s, searchQuery));
  }, [services, selectedCategory, searchQuery]);

  // ไปหน้ารายละเอียด service
  const goServiceDetail = (item: Service) => {
    router.push({
      pathname: "/(tabs)/p2p/service/[id]",
      params: { id: item.ServiceID },
    });
  };

  // ไปหน้าโปรไฟล์หมอดู
  const goFortuneTellerProfile = (item: Service) => {
    const ftId = item.FortuneTeller?.FortuneTellerID;
    if (!ftId) return;
    router.push({
      pathname: "/(tabs)/fortune_teller_profile/[id_fortune_teller]",
      params: { id_fortune_teller: ftId },
    });
  };

  return (
    <ScreenWrapper>
      <HeaderBar
        title="บริการดูดวง"
        showSearch
        // ✅ ใช้ onSearchSubmit จาก HeaderBar เพื่ออัปเดต query
        onSearchSubmit={(q) => setSearchQuery(q ?? "")}
        rightIcons={[
          { name: "calendar-month", onPress: () => router.push("/p2p/mybooking") },
        ]}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-3">กำลังโหลดข้อมูล...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.ServiceID}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ListHeaderComponent={
            <View className="mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-white font-bold">กรองตามหมวดหมู่</Text>
                {/* แสดงคำค้นปัจจุบันแบบเบา ๆ */}
                {searchQuery ? (
                  <Text className="text-white/60 text-xs" numberOfLines={1}>
                    ค้นหา: “{searchQuery}”
                  </Text>
                ) : null}
              </View>
              <View className="flex-row flex-wrap">
                {categories.map((c) => (
                  <CategoryChip
                    key={c}
                    label={c}
                    selected={selectedCategory === c}
                    onPress={() => setSelectedCategory(c)}
                  />
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <ServiceCard
              item={item}
              onPressCard={() => goServiceDetail(item)}
              onPressProfile={() => goFortuneTellerProfile(item)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-white/60">ไม่พบผลลัพธ์ตามเงื่อนไข</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}
