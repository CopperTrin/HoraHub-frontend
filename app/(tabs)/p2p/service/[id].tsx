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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import Entypo from "@expo/vector-icons/Entypo";

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

type ServiceDetail = {
  ServiceID: string;
  Service_name: string;
  Service_Description: string;
  Price: number;
  Avg_Rating?: number | null;
  ImageURLs?: string[];
  Category?: Category;
  FortuneTeller?: FortuneTeller;
};

type ReviewItem = {
  ReviewID: string;
  User: string; // userId
  Star: number; // 1..5
  Comment: string;
  Timestamp: string; // ISO
  ServiceID: string;
};

// ===== Helpers =====
const clampStar = (n: number) => Math.max(0, Math.min(5, Math.round(n || 0)));
const formatDatetimeTH = (iso: string) => {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  } catch {
    return iso;
  }
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

const ReviewCard = ({
  review,
  author,
}: {
  review: ReviewItem;
  author?: User | null;
}) => {
  const name = author?.UserInfo
    ? `${author.UserInfo.FirstName || ""} ${author.UserInfo.LastName || ""}`.trim() || "ผู้ใช้"
    : "ผู้ใช้";
  const avatar = author?.UserInfo?.PictureURL;

  return (
    <View className="bg-[#2D2A32] p-3 rounded-2xl border border-white/10 mb-3">
      <View className="flex-row items-center mb-2">
        {avatar ? (
          <Image source={{ uri: avatar }} className="w-8 h-8 rounded-full mr-2" />
        ) : (
          <View className="w-8 h-8 rounded-full bg-white/10 mr-2" />
        )}
        <View className="flex-1">
          <Text className="text-white text-sm font-semibold" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-white/50 text-[11px]" numberOfLines={1}>
            {formatDatetimeTH(review.Timestamp)}
          </Text>
        </View>
        <StarRow star={review.Star} />
      </View>
      {!!review.Comment && (
        <Text className="text-gray-200 text-sm leading-5">{review.Comment}</Text>
      )}
    </View>
  );
};

// ===== Page =====
export default function ServicePrettyDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // service id

  const API_BASE = "http://localhost:3456"; // เปลี่ยนเป็น IP เครื่องถ้ารันบนมือถือจริง

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [ftUser, setFtUser] = useState<User | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [allUsersMap, setAllUsersMap] = useState<Record<string, User>>({});

  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo(
    () => (service?.ImageURLs && service.ImageURLs.length > 0 ? service.ImageURLs : []),
    [service]
  );

  const ftName = useMemo(() => {
    if (!ftUser?.UserInfo) return "Fortune Teller";
    const first = ftUser.UserInfo.FirstName || "";
    const last = ftUser.UserInfo.LastName || "";
    const name = `${first} ${last}`.trim();
    return name || "Fortune Teller";
  }, [ftUser]);

  const reviewAvg = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + (r.Star || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      // 1) ดึงข้อมูล service
      const svcRes = await axios.get<ServiceDetail>(`${API_BASE}/services/${id}`);
      const svc = svcRes.data;
      setService(svc);

      // 2) ใช้ UserID ของหมอดูไปดึงโปรไฟล์จาก /users/{id}
      const userId = svc?.FortuneTeller?.UserID;
      const reqs: Promise<any>[] = [
        axios.get<ReviewItem[]>(`${API_BASE}/reviews`, { params: { serviceId: id } }),
        axios.get<User[]>(`${API_BASE}/users`), // ดึง users ทั้งหมดเพื่อ map ชื่อผู้รีวิว
      ];

      if (userId) reqs.push(axios.get<User>(`${API_BASE}/users/${userId}`));

      const [reviewsRes, usersRes, ftRes] = await Promise.allSettled(reqs);

      // reviews
      if (reviewsRes.status === "fulfilled") {
        setReviews(Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : []);
      } else {
        setReviews([]);
      }

      // users map
      if (usersRes.status === "fulfilled") {
        const arr: User[] = usersRes.value.data || [];
        const map: Record<string, User> = {};
        arr.forEach((u) => (map[u.UserID] = u));
        setAllUsersMap(map);
      } else {
        setAllUsersMap({});
      }

      // fortune teller user (optional)
      if (userId && ftRes && ftRes.status === "fulfilled") {
        setFtUser(ftRes.value.data);
      } else if (userId) {
        // fallback: ใช้จาก users map
        setFtUser((prev) => prev ?? allUsersMap[userId] ?? null);
      } else {
        setFtUser(null);
      }
    } catch (e: any) {
      console.log("Load error:", e?.message || e);
      Alert.alert("ดึงข้อมูลไม่สำเร็จ", e?.response?.data?.message || "โปรดลองใหม่");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / screenWidth);
    setActiveIndex(newIndex);
  };

  const goBook = () => {
    if (!service) return;
    router.push({
      pathname: "/p2p/[id]",
      params: {
        id: service.FortuneTeller?.FortuneTellerID || "",
        serviceName: service.Service_name,
        price: String(service.Price),
        duration: "30",
      },
    });
  };

  const goFortuneTellerProfile = () => {
    const ftId = service?.FortuneTeller?.FortuneTellerID;
    if (!ftId) return;
    router.push({
      pathname: "/(tabs)/fortune_teller_profile/[id_fortune_teller]",
      params: { id_fortune_teller: ftId },
    });
  };

  const title = service?.Service_name || "Service";

  if (loading) {
    return (
      <ScreenWrapper>
        <HeaderBar title="Service" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="text-white/80 mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      </ScreenWrapper>
    );
    }

  if (!service) {
    return (
      <ScreenWrapper>
        <HeaderBar title="Service" showBack />
        <View className="flex-1 items-center justify-center">
          <Text className="text-white/80">ไม่พบบริการ</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title={title} showBack showChat />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        {/* รูปบริการแบบสไลด์ */}
        <View className="mb-4">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {(images.length > 0 ? images : [undefined]).map((img, index) => (
              <Pressable key={index}>
                {img ? (
                  <Image
                    source={{ uri: img }}
                    style={{
                      width: screenWidth - 32,
                      height: 250,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: screenWidth - 32,
                      height: 250,
                      borderRadius: 12,
                    }}
                    className="bg-white/5 items-center justify-center"
                  >
                    <Text className="text-white/40">ไม่มีรูปภาพ</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>

          {/* Dot Indicator */}
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
            {(images.length > 0 ? images : [undefined]).map((_, index) => (
              <View
                key={index}
                className={`w-2.5 h-2.5 mx-1 rounded-full ${
                  activeIndex === index ? "bg-accent-200" : "bg-gray-400"
                }`}
              />
            ))}
          </View>
        </View>

        {/* ชื่อ + ราคา + หมวดหมู่ */}
        <Text className="text-alabaster text-xl font-bold mb-1" numberOfLines={2}>
          {service.Service_name}
        </Text>

        <View className="flex-row items-center justify-between mb-2">
          <View className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
            <Text className="text-[11px] text-white">
              {service.Category?.Category_name || "Uncategorized"}
            </Text>
          </View>
          <Text className="text-accent-200 text-2xl font-bold">฿{service.Price}</Text>
        </View>

        {/* ปุ่มเลือกช่วงเวลา */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={goBook}
            className="bg-accent-200 rounded-full py-4 items-center"
          >
            <Text className="text-black text-lg font-bold">เลือกช่วงเวลา</Text>
          </TouchableOpacity>
        </View>

        {/* โปรไฟล์หมอดู */}
        <TouchableOpacity
          onPress={goFortuneTellerProfile}
          className="flex-row items-center bg-primary-100 p-3 rounded-full mb-4"
          activeOpacity={0.9}
        >
          <View className="flex-row items-center justify-between gap-4">
            {ftUser?.UserInfo?.PictureURL ? (
              <Image
                source={{ uri: ftUser.UserInfo.PictureURL }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-white/10" />
            )}
            <View className="flex-1">
              <Text className="text-alabaster text-lg font-semibold" numberOfLines={1}>
                {ftName}
              </Text>
              <Text className="text-white/60 text-xs" numberOfLines={1}>
                ดูโปรไฟล์หมอดู →
              </Text>
            </View>
            <Entypo name="chevron-small-right" size={28} color="#F8F8F8" />
          </View>
        </TouchableOpacity>

        {/* รายละเอียดบริการ */}
        {!!service.Service_Description && (
          <Text className="text-alabaster text-base leading-6 mb-8">
            {service.Service_Description}
          </Text>
        )}

        {/* ===== รีวิวบริการนี้ ===== */}
        <View className="mt-2">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-lg font-semibold">รีวิวจากผู้ใช้</Text>
            <Text className="text-white/70 text-sm">
              {reviewAvg ? `⭐ ${reviewAvg} • ` : ""}
              {reviews.length} รีวิว
            </Text>
          </View>

          {reviews.length === 0 ? (
            <View className="bg-[#2D2A32] p-4 rounded-2xl border border-white/10">
              <Text className="text-white/70">ยังไม่มีรีวิวสำหรับบริการนี้</Text>
            </View>
          ) : (
            reviews
              .slice() // ไม่แก้ของเดิม
              .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
              .map((rv) => (
                <ReviewCard
                  key={rv.ReviewID}
                  review={rv}
                  author={allUsersMap[rv.User] || null}
                />
              ))
          )}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}
