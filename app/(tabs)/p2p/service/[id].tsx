// app/(tabs)/p2p/service/[id].tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Pressable,
  Alert,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import Entypo from "@expo/vector-icons/Entypo";
import * as SecureStore from "expo-secure-store"; // ✅ เพิ่มสำหรับเช็ค login

const { width: screenWidth } = Dimensions.get("window");

// ===== Types =====
type Category = {
  CategoryID: string;
  Category_name: string;
  Category_type: string;
  Category_Description?: string;
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
    FirstName?: string;
    LastName?: string;
    PictureURL?: string;
    Email?: string;
  };
};

type TimeSlotItem = {
  TimeSlotID: string;
  StartTime: string; // ISO
  EndTime: string; // ISO
  LockAmount: number;
  Status: "AVAILABLE" | "BOOKED" | "CANCELLED";
  FortuneTellerID: string;
  ServiceID: string;
};

type ServiceDetail = {
  ServiceID: string;
  Service_name: string;
  Service_Description: string;
  Price: number;
  Avg_Rating?: number | null;
  ImageURLs?: string[];
  Category?: Category;
  FortuneTeller?: FortuneTeller;
  TimeSlots?: TimeSlotItem[];
};

type ReviewItem = {
  ReviewID: string;
  User: string;
  Star: number;
  Comment: string;
  Timestamp: string; // ISO
  ServiceID: string;
};

// ===== Helpers =====
const pad2 = (n: number) => String(n).padStart(2, "0");
const thaiMonthsShort = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const parseDate = (iso: string) => new Date(iso);
const formatDateTH = (iso: string) => {
  const d = parseDate(iso);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
};
const formatTimeTH = (iso: string) => {
  const d = parseDate(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const clampStar = (n: number) => Math.max(0, Math.min(5, Math.round(n || 0)));
const toYMD = (iso: string) => {
  const d = parseDate(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const sameDay = (isoA: string, ymdOrIsoB: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymdOrIsoB)) return toYMD(isoA) === ymdOrIsoB;
  return toYMD(isoA) === toYMD(ymdOrIsoB);
};

// ===== Components =====
const StarRow = ({ star }: { star: number }) => {
  const s = clampStar(star);
  return (
    <Text className="text-yellow-400">
      {"★".repeat(s)}
      <Text className="text-gray-500">{"★".repeat(5 - s)}</Text>
    </Text>
  );
};

const ReviewCard = ({ review }: { review: ReviewItem }) => (
  <View className="bg-[#211A3A] p-3 rounded-2xl border border-white/10 mb-3">
    <Text className="text-white font-semibold">{review.User}</Text>
    <StarRow star={review.Star} />
    <Text className="text-white/70 mt-1">{review.Comment}</Text>
  </View>
);

// ===== Page =====
export default function ServicePrettyDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const API_BASE =
    Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [ftUser, setFtUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const images = useMemo(
    () =>
      service?.ImageURLs && service.ImageURLs.length > 0
        ? service.ImageURLs
        : [],
    [service]
  );

  const ftName = useMemo(() => {
    if (!ftUser?.UserInfo) return "Fortune Teller";
    const f = ftUser.UserInfo.FirstName || "";
    const l = ftUser.UserInfo.LastName || "";
    return `${f} ${l}`.trim() || "Fortune Teller";
  }, [ftUser]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get<ServiceDetail>(`${API_BASE}/services/${id}`);
      const svc = res.data;
      setService(svc);

      if (svc.FortuneTeller?.UserID) {
        const ftRes = await axios.get<User>(
          `${API_BASE}/users/${svc.FortuneTeller.UserID}`
        );
        setFtUser(ftRes.data);
      }

      const rvRes = await axios.get<ReviewItem[]>(
        `${API_BASE}/reviews?serviceId=${id}`
      );
      setReviews(rvRes.data);
    } catch (e: any) {
      console.log("Load error:", e?.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const availableSlots = (service?.TimeSlots || []).filter(
    (s) => s.Status === "AVAILABLE"
  );

  const dateOptions = useMemo(() => {
    const set = new Set<string>();
    availableSlots.forEach((s) => set.add(toYMD(s.StartTime)));
    return Array.from(set).sort();
  }, [availableSlots]);

  useEffect(() => {
    if (!selectedDate && dateOptions.length > 0) setSelectedDate(dateOptions[0]);
  }, [dateOptions, selectedDate]);

  const filteredSlots = useMemo(() => {
    if (!selectedDate) return [];
    return availableSlots.filter((s) => sameDay(s.StartTime, selectedDate));
  }, [availableSlots, selectedDate]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(offsetX / screenWidth));
  };

  // ✅ เช็ค login ก่อน router.push()
  const confirmBookNow = async () => {
    if (!service || !selectedSlot) {
      Alert.alert("ยังไม่ได้เลือกช่วงเวลา", "Please select a time slot first.");
      return;
    }

    const token = await SecureStore.getItemAsync("access_token");
    if (!token) {
      Alert.alert("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนจองบริการ", [
        { text: "เข้าสู่ระบบ", onPress: () => router.replace("/profile") },
        { text: "ยกเลิก" },
      ]);
      return;
    }

    router.push({
      pathname: "/(tabs)/p2p/confirm",
      params: {
        serviceId: service.ServiceID,
        serviceName: service.Service_name,
        price: String(service.Price),
        fortuneTellerName: ftName,
        slotId: selectedSlot.TimeSlotID,
        startTime: selectedSlot.StartTime,
        endTime: selectedSlot.EndTime,
      },
    });

    setModalVisible(false);
  };

  if (loading)
    return (
      <ScreenWrapper>
        <HeaderBar title="Service" showBack />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#fff" />
          <Text className="text-white mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      </ScreenWrapper>
    );

  if (!service)
    return (
      <ScreenWrapper>
        <HeaderBar title="Service" showBack />
        <View className="flex-1 justify-center items-center">
          <Text className="text-white/70">ไม่พบบริการ</Text>
        </View>
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <HeaderBar title={service.Service_name} showBack showChat />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* รูป */}
        <ScrollView
          horizontal
          pagingEnabled
          onScroll={handleScroll}
          showsHorizontalScrollIndicator={false}
        >
          {(images.length > 0 ? images : [undefined]).map((img, i) => (
            <View key={i} style={{ width: screenWidth - 32 }}>
              {img ? (
                <Image
                  source={{ uri: img }}
                  style={{
                    width: screenWidth - 32,
                    height: 220,
                    borderRadius: 12,
                  }}
                />
              ) : (
                <View className="w-full h-[220px] bg-white/10 rounded-xl items-center justify-center">
                  <Text className="text-white/60">ไม่มีรูปภาพ</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View className="flex-row justify-center mt-2">
          {(images.length > 0 ? images : [undefined]).map((_, i) => (
            <View
              key={i}
              className={`w-2.5 h-2.5 rounded-full mx-1 ${
                activeIndex === i ? "bg-accent-200" : "bg-white/30"
              }`}
            />
          ))}
        </View>

        {/* ข้อมูลบริการ */}
        <Text className="text-white text-2xl font-bold mt-3">
          {service.Service_name}
        </Text>
        <Text className="text-yellow-400 font-bold text-xl mt-1">
          ฿{service.Price}
        </Text>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-accent-200 py-4 mt-5 rounded-full items-center"
        >
          <Text className="text-black font-bold text-lg">Booking time slot</Text>
        </TouchableOpacity>

        {/* หมอดู */}
        <View className="flex-row items-center mt-6">
          {ftUser?.UserInfo?.PictureURL ? (
            <Image
              source={{ uri: ftUser.UserInfo.PictureURL }}
              className="w-12 h-12 rounded-full mr-3"
            />
          ) : (
            <View className="w-12 h-12 bg-white/10 rounded-full mr-3" />
          )}
          <Text className="text-white text-lg">{ftName}</Text>
        </View>

        <Text className="text-white/80 mt-3 leading-6">
          {service.Service_Description}
        </Text>

        {/* รีวิว */}
        <View className="mt-6">
          <Text className="text-white font-bold text-lg mb-2">
            รีวิวทั้งหมด ({reviews.length})
          </Text>
          {reviews.length === 0 ? (
            <Text className="text-white/60">ยังไม่มีรีวิว</Text>
          ) : (
            reviews.map((r) => <ReviewCard key={r.ReviewID} review={r} />)
          )}
        </View>
      </ScrollView>

      {/* Modal เลือกช่วงเวลา */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />
        <View className="bg-[#211A3A] rounded-t-3xl px-4 pt-4 pb-6">
          <Text className="text-white font-bold text-lg mb-3">
            เลือกช่วงเวลา
          </Text>

          {filteredSlots.length === 0 ? (
            <Text className="text-white/70">ไม่มีช่วงเวลาว่าง</Text>
          ) : (
            <FlatList
              data={filteredSlots}
              keyExtractor={(it) => it.TimeSlotID}
              renderItem={({ item }) => {
                const active = selectedSlot?.TimeSlotID === item.TimeSlotID;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedSlot(item)}
                    className={`flex-row justify-between px-3 py-3 rounded-2xl mb-2 border ${
                      active
                        ? "bg-white/10 border-accent-200"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <View>
                      <Text className="text-white font-medium">
                        {formatDateTH(item.StartTime)}
                      </Text>
                      <Text className="text-white/70 mt-0.5">
                        {formatTimeTH(item.StartTime)} -{" "}
                        {formatTimeTH(item.EndTime)}
                      </Text>
                    </View>
                    {active ? (
                      <Entypo name="check" size={22} color="#F9D85E" />
                    ) : (
                      <Entypo name="circle" size={18} color="#CFCFCF" />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 300 }}
            />
          )}

          <View className="flex-row mt-3">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="flex-1 mr-2 px-4 py-3 rounded-full bg-white/10 items-center justify-center"
            >
              <Text className="text-white font-semibold">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!selectedSlot}
              onPress={confirmBookNow}
              className={`flex-1 px-4 py-3 rounded-full items-center justify-center ${
                selectedSlot ? "bg-accent-200" : "bg-white/10"
              }`}
            >
              <Text
                className={`font-bold ${
                  selectedSlot ? "text-black" : "text-white/40"
                }`}
              >
                Booking
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}