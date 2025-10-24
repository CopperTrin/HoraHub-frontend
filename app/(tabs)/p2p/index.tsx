import React, { useMemo, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";

// --- Demo images ---
import p2p_user_1 from "@/assets/images/p2p/ft2.png";
import p2p_user_2 from "@/assets/images/p2p/ft2.png";
import p2p_user_3 from "@/assets/images/p2p/ft2.png";
import p2p_user_4 from "@/assets/images/p2p/ft2.png";

// ===== Types =====
type Provider = {
  id: string;
  name: string;
  imageUrl: any;
  rating: number;
  servicesOffered: string[];
};

// ===== Mock Data =====
const providers: Provider[] = [
  { id: "1", name: "Dr.ช้าง ทศพร", imageUrl: p2p_user_1, rating: 4.8, servicesOffered: ["โหราศาสตร์ไทย", "ไพ่ทาโรต์"] },
  { id: "2", name: "Dr.ลักษณ์ ราชสีห์", imageUrl: p2p_user_2, rating: 5.0, servicesOffered: ["ดูดวงวันเดือนปีเกิด"] },
  { id: "3", name: "Dr.ปลาย พรายกระซิบ", imageUrl: p2p_user_3, rating: 4.9, servicesOffered: ["ดูดวงเบอร์โทรศัพท์", "ไพ่ทาโรต์"] },
  { id: "4", name: "Dr.คฑา ชินบัญชร", imageUrl: p2p_user_4, rating: 4.7, servicesOffered: ["ไพ่ทาโรต์"] },
];

// ===== Chip (Filter) =====
const FilterChip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} className="mr-2 mb-2 active:opacity-80">
    <View
      className={`px-3 py-1.5 rounded-full border ${
        selected ? "bg-yellow-400 border-yellow-400" : "bg-white/10 border-white/15"
      }`}
    >
      <Text className={`font-bold ${selected ? "text-black" : "text-white"} text-xs`}>{label}</Text>
    </View>
  </TouchableOpacity>
);

// ===== Badge: แท็กบริการ =====
const SkillBadge = ({ text }: { text: string }) => (
  <View className="px-2 py-1 mr-1.5 mt-1 rounded-full bg-white/10 border border-white/15">
    <Text className="text-white text-[10px] font-semibold">{text}</Text>
  </View>
);

// ===== Card: รูป + ชื่อ + เรตติ้ง + แท็กบริการ (1–2 อัน) =====
const ProviderCard = ({
  provider,
  onPress,
}: {
  provider: Provider;
  onPress: () => void;
}) => {
  const specialties = provider.servicesOffered.slice(0, 2);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-[#7431FA] border border-white/10 rounded-2xl p-2 mb-4"
    >
      <View className="flex-row items-center">
        <Image source={provider.imageUrl} className="w-16 h-16 rounded-full" />
        <View className="ml-3">
          <Text className="text-white font-bold text-base">{provider.name}</Text>
          <Text className="text-yellow-400 text-xs mt-1">★ {provider.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View className="mt-3 flex-row flex-wrap">
        {specialties.length > 0 ? (
          specialties.map((sp) => <SkillBadge key={sp} text={sp} />)
        ) : (
          <Text className="text-white/40 text-[11px]">—</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ===== Page =====
export default function P2pListSimplePage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState("ทั้งหมด");

  const allServices = useMemo(
    () => Array.from(new Set(["ทั้งหมด", ...providers.flatMap((p) => p.servicesOffered)])),
    []
  );

  const filteredProviders = useMemo(() => {
    if (selectedService === "ทั้งหมด") return providers;
    return providers.filter((p) => p.servicesOffered.includes(selectedService));
  }, [selectedService]);

  return (
    <ScreenWrapper>
      <HeaderBar
        title="P2P"
        rightIcons={[
          { name: "calendar-month", onPress: () => router.push("/p2p/mybooking") },
        ]}
        showSearch
        showChat
        onSearchSubmit={(query) => {
          console.log("ค้นหา:", query);
        }}
      />
      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          // เลือก serviceName ตัวแรกของหมอดู เพื่อส่งไปหน้าหา slot
          const firstService = item.servicesOffered[0] ?? "";
          return (
            <ProviderCard
              provider={item}
              onPress={() =>
                router.push({
                  pathname: `/p2p/timeslot/${item.id}`, // ← ไปหน้า [id] ที่สร้างไว้
                  params: {
                    id: item.id,
                    serviceName: firstService, // ส่ง serviceName ไปให้หน้านั้น filter slot ได้เลย
                  },
                })
              }
            />
          );
        }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-white font-bold text-base mb-2">เลือกบริการที่คุณสนใจ</Text>
            <View className="flex-row flex-wrap">
              {allServices.map((service) => (
                <FilterChip
                  key={service}
                  label={service}
                  selected={selectedService === service}
                  onPress={() => setSelectedService(service)}
                />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-white/60">ไม่พบหมอดู</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
