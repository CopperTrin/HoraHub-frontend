// app/(tabs)/p2p/service/[id].tsx
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import Entypo from "@expo/vector-icons/Entypo";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

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
  StartTime: string; 
  EndTime: string; 
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
  Timestamp: string; 
  ServiceID: string;
};

// ===== Helpers (safe, no-Intl) =====
const pad2 = (n: number) => String(n).padStart(2, "0");
const thaiMonthsShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const parseDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${iso}`);
  return d;
};

const formatDateTH = (iso: string) => {
  try {
    const d = parseDate(iso);
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return iso;
  }
};

const formatTimeTH = (iso: string) => {
  try {
    const d = parseDate(iso);
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());
    return `${hh}:${mm}`;
  } catch {
    return "--:--";
  }
};

const formatDatetimeTH = (iso: string) => {
  try {
    const d = parseDate(iso);
    const dd = pad2(d.getDate());
    const mon = thaiMonthsShort[d.getMonth()];
    const yyyy = d.getFullYear();
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());
    return `${dd} ${mon} ${yyyy} ${hh}:${mm}`;
  } catch {
    return iso;
  }
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

const ReviewCard = ({ review, author }: { review: ReviewItem; author?: User | null }) => {
  const name = author?.UserInfo
    ? `${author.UserInfo.FirstName || ""} ${author.UserInfo.LastName || ""}`.trim() || "ผู้ใช้"
    : "ผู้ใช้";
  const avatar = author?.UserInfo?.PictureURL;

  return (
    <View className="bg-[#211A3A] p-3 rounded-2xl border border-white/10 mb-3">
      <View className="flex-row items-center mb-2">
        {avatar ? (
          <Image source={{ uri: avatar }} className="w-8 h-8 rounded-full mr-2" />
        ) : (
          <View className="w-8 h-8 rounded-full bg-white/10 mr-2" />
        )}
        <View className="flex-1">
          <Text className="text-white text-sm font-semibold" numberOfLines={1}>{name}</Text>
          <Text className="text-white/50 text-[11px]" numberOfLines={1}>{formatDatetimeTH(review.Timestamp)}</Text>
        </View>
        <StarRow star={review.Star} />
      </View>
      {!!review.Comment && <Text className="text-gray-200 text-sm leading-5">{review.Comment}</Text>}
    </View>
  );
};

// ===== Page =====
export default function ServicePrettyDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // service id

  const API_BASE = "https://softdev-horahub-backend-production.up.railway.app";

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [ftUser, setFtUser] = useState<User | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [allUsersMap, setAllUsersMap] = useState<Record<string, User>>({});

  const [activeIndex, setActiveIndex] = useState(0);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotItem | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);

      const svcRes = await axios.get<ServiceDetail>(`${API_BASE}/services/${id}`);
      const svc = svcRes.data;
      const slots = (svc.TimeSlots || [])
        .slice()
        .sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime());
      setService({ ...svc, TimeSlots: slots });

      const userId = svc?.FortuneTeller?.UserID;
      const reqs: Promise<any>[] = [
        axios.get<ReviewItem[]>(`${API_BASE}/reviews`, { params: { serviceId: id } }),
        axios.get<User[]>(`${API_BASE}/users`),
      ];
      if (userId) reqs.push(axios.get<User>(`${API_BASE}/users/${userId}`));

      const [reviewsRes, usersRes, ftRes] = await Promise.allSettled(reqs);

      if (reviewsRes.status === "fulfilled") {
        setReviews(Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : []);
      } else {
        setReviews([]);
      }

      if (usersRes.status === "fulfilled") {
        const arr: User[] = usersRes.value.data || [];
        const map: Record<string, User> = {};
        arr.forEach((u) => (map[u.UserID] = u));
        setAllUsersMap(map);
      } else {
        setAllUsersMap({});
      }

      if (userId && ftRes && ftRes.status === "fulfilled") {
        setFtUser(ftRes.value.data);
      } else if (userId) {
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

  // ===== Slots =====
  const availableSlots = (service?.TimeSlots || []).filter((s) => s.Status === "AVAILABLE");
  const dateOptions = useMemo(() => {
    const set = new Set<string>();
    (availableSlots || []).forEach((s) => set.add(toYMD(s.StartTime)));
    return Array.from(set).sort();
  }, [availableSlots]);

  useEffect(() => {
    if (!selectedDate && dateOptions.length > 0) {
      setSelectedDate(dateOptions[0]);
    }
  }, [dateOptions, selectedDate]);

  const filteredSlots = useMemo(() => {
    if (!selectedDate) return [];
    return availableSlots.filter((s) => sameDay(s.StartTime, selectedDate));
  }, [availableSlots, selectedDate]);


  const openSlotModal = () => setModalVisible(true);

  const confirmBookNow = async () => {
    if (!service || !selectedSlot) {
      return Alert.alert("ยังไม่ได้เลือกช่วงเวลา", "Please select a time slot first.");
    }

    const token = await SecureStore.getItemAsync("access_token");
    if (!token) {
      Alert.alert("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนจองบริการ", [
        { text: "เข้าสู่ระบบ", onPress: () => router.replace("/profile") },
        { text: "ยกเลิก" },
      ]);
      return;
    }

    try {

      const userRes = await axios.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = userRes.data?.UserID;

      router.push({
        pathname: "/(tabs)/p2p/confirm",
        params: {
          serviceId: service.ServiceID,
          serviceName: service.Service_name,
          price: String(service.Price),
          fortuneTellerId: service.FortuneTeller?.FortuneTellerID || "",
          fortuneTellerName:
            (ftUser?.UserInfo &&
              `${ftUser.UserInfo.FirstName || ""} ${ftUser.UserInfo.LastName || ""}`.trim()) ||
            "",
          slotId: selectedSlot.TimeSlotID, 
          startTime: selectedSlot.StartTime,
          endTime: selectedSlot.EndTime,
          returnTo: `/(tabs)/p2p/service/${service.ServiceID}`,
          customerId: userId, 
        },
      });

      setModalVisible(false);
    } catch (err) {
      console.log("Error fetching user:", err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลผู้ใช้ได้");
    }
  };


  const title = service?.Service_name || "Service";

  if (loading)
    return (
      <ScreenWrapper>
        <HeaderBar title="Service" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="text-white/80 mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      </ScreenWrapper>
    );

  if (!service)
    return (
      <ScreenWrapper>
        <HeaderBar title="Service" showBack />
        <View className="flex-1 items-center justify-center">
          <Text className="text-white/80">ไม่พบบริการ</Text>
        </View>
      </ScreenWrapper>
    );

  return (
<ScreenWrapper>
      <HeaderBar title={title} showBack showChat />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
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
                    style={{ width: screenWidth - 32, height: 250, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{ width: screenWidth - 32, height: 250, borderRadius: 12 }}
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
                className={`w-2.5 h-2.5 mx-1 rounded-full ${activeIndex === index ? "bg-accent-200" : "bg-gray-400"}`}
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

        {/* ปุ่มเลือกช่วงเวลา → เปิด Modal */}
        <View className="mb-4">
          <TouchableOpacity onPress={openSlotModal} className="bg-accent-200 rounded-full py-4 items-center">
            <Text className="text-black text-lg font-bold">Booking time slot</Text>
          </TouchableOpacity>
        </View>

        {/* โปรไฟล์หมอดู */}
        <TouchableOpacity
          onPress={() => {
            const ftId = service.FortuneTeller?.FortuneTellerID;
            if (!ftId) return;
            router.push(`/(tabs)/fortune_teller_profile/${ftId}?from_id=${id}`);
          }}
          className="flex-row items-center bg-primary-100 p-3 rounded-full mb-4"
          activeOpacity={0.9}
        >
          <View className="flex-row items-center justify-between gap-4">
            {ftUser?.UserInfo?.PictureURL ? (
              <Image source={{ uri: ftUser.UserInfo.PictureURL }} className="w-12 h-12 rounded-full" />
            ) : (
              <View className="w-12 h-12 rounded-full bg-white/10" />
            )}
            <View className="flex-1">
              <Text className="text-alabaster text-lg font-semibold" numberOfLines={1}>{ftName}</Text>
            </View>
            <Entypo name="chevron-small-right" size={28} color="#F8F8F8" />
          </View>
        </TouchableOpacity>

        {/* รายละเอียดบริการ */}
        {!!service.Service_Description && (
          <Text className="text-alabaster text-base leading-6 mb-8">{service.Service_Description}</Text>
        )}

        {/* รีวิว */}
        <View className="mt-2">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-lg font-semibold">Review</Text>
            <Text className="text-white/70 text-sm">{reviews.length} Review</Text>
          </View>

          {reviews.length === 0 ? (
            <View className="bg-[#2D2A32] p-4 rounded-2xl border border-white/10">
              <Text className="text-white/70">no reviews yet.</Text>
            </View>
          ) : (
            reviews
              .slice()
              .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
              .map((rv) => <ReviewCard key={rv.ReviewID} review={rv} author={allUsersMap[rv.User] || null} />)
          )}
        </View>
      </ScrollView>

      {/* ================== Modal: เลือก Time Slot + ฟิลเตอร์วัน ================== */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        {/* backdrop */}
        <TouchableOpacity activeOpacity={1} onPress={() => setModalVisible(false)} className="flex-1 bg-black/50" />
        {/* sheet */}
        <View className="bg-[#211A3A] rounded-t-3xl px-4 pt-4 pb-6 border-t border-white/10">
          <View className="w-12 h-1.5 bg-white/20 self-center rounded-full mb-3" />
          <Text className="text-white text-lg font-semibold mb-2">Choose time slot</Text>

          {availableSlots.length === 0 ? (
            <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <Text className="text-white/70">ยังไม่มีช่วงเวลาว่างสำหรับบริการนี้</Text>
            </View>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ paddingHorizontal: 2 }}>
                {dateOptions.map((d) => {
                  const active = selectedDate === d;
                  const D = parseDate(d + "T00:00:00");
                  const label = `${pad2(D.getDate())} ${thaiMonthsShort[D.getMonth()]} ${D.getFullYear()}`;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => {
                        setSelectedDate(d);
                        if (selectedSlot && !sameDay(selectedSlot.StartTime, d)) {
                          setSelectedSlot(null);
                        }
                      }}
                      className={`px-3 py-2 mr-2 rounded-full border ${active ? "bg-accent-200 border-accent-200" : "bg-white/5 border-white/10"}`}
                      activeOpacity={0.9}
                    >
                      <Text className={active ? "text-black font-semibold" : "text-white"}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* รายการ slot ของ "วัน" ที่เลือก */}
              {filteredSlots.length === 0 ? (
                <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <Text className="text-white/70">ไม่มีช่วงเวลาว่างในวันที่เลือก</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredSlots}
                  keyExtractor={(it) => it.TimeSlotID}
                  contentContainerStyle={{ paddingBottom: 10 }}
                  renderItem={({ item }) => {
                    const active = selectedSlot?.TimeSlotID === item.TimeSlotID;
                    return (
                      <TouchableOpacity
                        onPress={() => setSelectedSlot(item)}
                        className={`flex-row items-center justify-between px-3 py-3 rounded-2xl mb-2 border ${active ? "bg-white/10 border-accent-200" : "bg-white/5 border-white/10"}`}
                      >
                        <View>
                          <Text className="text-white font-medium">{formatDateTH(item.StartTime)}</Text>
                          <Text className="text-white/70 mt-0.5">
                            {formatTimeTH(item.StartTime)} - {formatTimeTH(item.EndTime)}
                          </Text>
                        </View>
                        {active ? <Entypo name="check" size={22} color="#F9D85E" /> : <Entypo name="circle" size={18} color="#CFCFCF" />}
                      </TouchableOpacity>
                    );
                  }}
                  style={{ maxHeight: 320 }}
                />
              )}
            </>
          )}

          <View className="flex-row mt-3">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="flex-1 mr-2 px-4 py-3 rounded-full bg-white/10 items-center justify-center border border-white/10"
            >
              <Text className="text-white font-semibold">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!selectedSlot}
              onPress={confirmBookNow}
              className={`flex-1 px-4 py-3 rounded-full items-center justify-center ${selectedSlot ? "bg-accent-200" : "bg-white/10"}`}
            >
              <Text className={`font-bold ${selectedSlot ? "text-black" : "text-white/40"}`}>Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ============================================================ */}
    </ScreenWrapper>
  );
}