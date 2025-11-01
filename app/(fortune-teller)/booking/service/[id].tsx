import Feather from "@expo/vector-icons/Feather";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";

type ServiceDetail = {
  ServiceID: string;
  Service_name: string;
  Service_Description: string | null;
  Price: number;
  Avg_Rating: number | null;
  ImageURLs?: string[] | null;
  CategoryID: string;
  FortuneTellerID: string;
  Category?: {
    CategoryID: string;
    Category_name: string;
    Category_Description?: string;
    Category_type?: string;
  };
};

type Category = {
  CategoryID: string;
  Category_name: string;
  Category_Description?: string;
  Category_type?: string;
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

const ACCESS_TOKEN_KEY = "access_token";
const computeBaseURL = () => {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env;
  // @ts-ignore
  const { Platform } = require("react-native");
  return Platform.OS === "android"
    ? "http://10.0.2.2:3456"
    : "http://localhost:3456";
};
const api = axios.create({ baseURL: computeBaseURL(), timeout: 15000 });
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

const toLocalDateLabel = (d: Date) =>
  d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
const toLocalTimeLabel = (d: Date) =>
  d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

// ---------- TimeSlot Card ----------
const TimeSlotCard = ({
  slot,
  onDeleteSlot,
}: {
  slot: TimeSlotItem;
  onDeleteSlot?: (id: string) => void;
}) => {
  const start = new Date(slot.StartTime);
  const end = new Date(slot.EndTime);

  return (
    <View className="bg-[#211A3A] rounded-2xl p-4 mb-3 border border-white/10 flex-row justify-between items-start">
      <View className="flex-1 pr-2">
        <Text className="text-white font-bold text-base">{toLocalDateLabel(start)}</Text>
        <Text className="text-white/70 mt-1">
          {toLocalTimeLabel(start)} - {toLocalTimeLabel(end)}
        </Text>
        <View className="bg-green-500/20 border border-green-400/50 px-2 py-1 rounded-full mt-2 self-start">
          <Text className="text-green-400 font-bold text-xs">ว่าง</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onDeleteSlot?.(slot.TimeSlotID)}
        className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20"
      >
        <Feather name="trash-2" size={18} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );
};

// ---------- Main ----------
export default function ServiceDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [serviceTimeSlots, setServiceTimeSlots] = useState<TimeSlotItem[]>([]);
  const [showEdit, setShowEdit] = useState(false);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);

      const [svcRes, catRes] = await Promise.all([
        api.get<ServiceDetail>(`/services/${id}`),
        api.get<Category[]>(`/service-categories`),
      ]);

      let tsData: TimeSlotItem[] = [];
      try {
        const tsRes = await api.get<TimeSlotItem[]>(`/time-slots/me`);
        tsData = tsRes.data || [];
      } catch {
        console.log("time-slot fetch failed (unauthorized?)");
      }

      const svc = svcRes.data;
      setService(svc);

      setName(svc.Service_name ?? "");
      setDesc(svc.Service_Description ?? "");
      setPrice(String(svc.Price ?? ""));
      setCategoryId(svc.CategoryID ?? "");
      setImages(Array.isArray(svc.ImageURLs) ? svc.ImageURLs.filter(Boolean) : []);
      setCategories(catRes.data ?? []);

      // ✅ Filter เฉพาะ TimeSlot ที่ Status = AVAILABLE
      const onlyAvailable = (tsData || [])
        .filter((t) => t.ServiceID === id && t.Status === "AVAILABLE")
        .sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime());

      setServiceTimeSlots(onlyAvailable);
    } catch (e: any) {
      console.error("Load service error:", e?.response?.data ?? e);
      Alert.alert("ดึงข้อมูลไม่สำเร็จ", e?.response?.data?.message || "โปรดลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onSave = async () => {
    if (!service?.ServiceID) return Alert.alert("ยังโหลดข้อมูลไม่เสร็จ");
    if (!name.trim()) return Alert.alert("กรอกไม่ครบ", "กรุณาใส่ชื่อบริการ");
    if (!categoryId) return Alert.alert("กรอกไม่ครบ", "กรุณาเลือกหมวดหมู่");

    try {
      setSaving(true);
      await api.patch(`/services/${service.ServiceID}`, {
        Service_name: name.trim(),
        Service_Description: desc.trim(),
        Price: Number(price || 0),
        ImageURLs: images,
        CategoryID: categoryId,
      });
      Alert.alert("สำเร็จ", "อัปเดตบริการเรียบร้อย");
      setShowEdit(false);
      fetchAll();
    } catch (e: any) {
      console.log("Save service error:", e?.message || e);
      Alert.alert("บันทึกไม่สำเร็จ", e?.response?.data?.message || e?.message || "โปรดลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteSlot = (timeSlotId: string) => {
    Alert.alert("ยืนยันการลบ", "คุณต้องการลบ Time Slot นี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await api.delete(`/time-slots/${timeSlotId}`);
            Alert.alert("สำเร็จ", "ลบ Time Slot เรียบร้อยแล้ว");
            fetchAll();
          } catch (e: any) {
            console.error("Delete timeslot error:", e?.response?.data ?? e);
            Alert.alert("ลบไม่สำเร็จ", e?.response?.data?.message || "โปรดลองใหม่");
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const onDeleteService = async () => {
    if (!service?.ServiceID) return;
    Alert.alert("ยืนยันการลบ", "คุณต้องการลบบริการนี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await api.delete(`/services/${service.ServiceID}`);
            Alert.alert("ลบสำเร็จ", "บริการนี้ถูกลบเรียบร้อยแล้ว");
            router.replace("/(fortune-teller)/booking");
          } catch (e: any) {
            console.log("Delete service error:", e?.message || e);
            Alert.alert("ลบไม่สำเร็จ", e?.response?.data?.message || e?.message || "โปรดลองใหม่");
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const onCreateTimeSlot = () => {
    if (!service?.ServiceID) return;
    router.push({
      pathname: "/(fortune-teller)/booking/[id]",
      params: { id: "new", serviceId: service.ServiceID, serviceName: service.Service_name },
    });
  };

  const title = useMemo(() => service?.Service_name ?? "Service Detail", [service]);

  if (loading)
    return (
      <ScreenWrapper>
        <HeaderBar title="Service Detail" showBack />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white/70 mt-3">กำลังโหลดข้อมูล...</Text>
        </View>
      </ScreenWrapper>
    );

  if (!service)
    return (
      <ScreenWrapper>
        <HeaderBar title="Service Detail" showBack />
        <View className="flex-1 justify-center items-center">
          <Text className="text-white/70">ไม่พบบริการ</Text>
        </View>
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <HeaderBar title={title} showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8 }}>
        <TouchableOpacity
          onPress={onCreateTimeSlot}
          className="bg-yellow-400 rounded-full items-center justify-center py-4 mb-3"
        >
          <Text className="text-black font-extrabold text-base">Create Time Slot</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            onPress={() => setShowEdit((v) => !v)}
            className="flex-1 bg-white/10 border border-white/10 rounded-full items-center justify-center py-4 mr-2"
          >
            <Text className="text-white font-bold text-base">{showEdit ? "Close Edit" : "Edit Service"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDeleteService}
            disabled={saving}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center"
          >
            <Feather name="trash-2" size={18} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </View>

        {!showEdit && (
          <>
            <View className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
              {!!images?.length && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  {images.map((u) => (
                    <Image key={u} source={{ uri: u }} className="w-40 h-40 rounded-xl mr-3" resizeMode="cover" />
                  ))}
                </ScrollView>
              )}
              <Text className="text-white font-semibold text-lg">{service.Service_name}</Text>
              {!!service.Service_Description && (
                <Text className="text-white/70 mt-2">{service.Service_Description}</Text>
              )}
              <Text className="text-white/75 mt-2">ราคา: <Text className="font-semibold">{service.Price}</Text></Text>
              <Text className="text-white/75 mt-1">
                Category:{" "}
                <Text className="font-semibold">
                  {service?.Category?.Category_name ?? service?.CategoryID ?? "-"}
                </Text>
              </Text>
            </View>

            <Text className="text-white/80 font-bold mb-3 text-base">Time Slots (AVAILABLE)</Text>
            {Array.isArray(serviceTimeSlots) && serviceTimeSlots.length > 0 ? (
              serviceTimeSlots.map((t) => (
                <TimeSlotCard key={t.TimeSlotID} slot={t} onDeleteSlot={onDeleteSlot} />
              ))
            ) : (
              <View className="items-center justify-center bg-white/10 p-6 rounded-2xl mb-6">
                <Text className="text-white/60">ยังไม่มี Time Slot ที่ว่าง</Text>
              </View>
            )}
          </>
        )}

        {showEdit && (
          <>
            <Text className="text-white/70 mb-2 mt-2">Service name</Text>
            <View className="bg-white/10 rounded-2xl px-3 py-2 mb-4 border border-white/10">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="ชื่อบริการ"
                placeholderTextColor="#9CA3AF"
                className="text-white text-base py-2"
              />
            </View>

            <Text className="text-white/70 mb-2">Description</Text>
            <View className="bg-white/10 rounded-2xl px-3 py-2 mb-4 border border-white/10">
              <TextInput
                value={desc}
                onChangeText={setDesc}
                multiline
                placeholder="คำอธิบายบริการ"
                placeholderTextColor="#9CA3AF"
                className="text-white text-base py-2"
              />
            </View>

            <Text className="text-white/70 mb-2">Price</Text>
            <View className="bg-white/10 rounded-2xl px-3 py-2 mb-4 border border-white/10">
              <TextInput
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholder="เช่น 49.99"
                placeholderTextColor="#9CA3AF"
                className="text-white text-base py-2"
              />
            </View>

            <Text className="text-white/70 mb-2">Category</Text>
            <View className="bg-white/10 rounded-2xl p-3 mb-4 border border-white/10">
              <View className="flex-row flex-wrap gap-2">
                {Array.isArray(categories) &&
                  categories.map((c) => {
                    const active = categoryId === c.CategoryID;
                    return (
                      <TouchableOpacity
                        key={c.CategoryID}
                        onPress={() => setCategoryId(c.CategoryID)}
                        className={`px-3 py-2 rounded-xl border ${
                          active ? "bg-yellow-400/20 border-yellow-400" : "bg-white/5 border-white/10"
                        }`}
                      >
                        <Text className={`${active ? "text-yellow-300" : "text-white/80"} font-medium`}>
                          {c.Category_name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </View>

            <Text className="text-white/70 mb-2">Image URLs</Text>
            <View className="bg-white/10 rounded-2xl px-3 py-3 mb-2 border border-white/10">
              <View className="flex-row">
                <TextInput
                  value={imageInput}
                  onChangeText={setImageInput}
                  placeholder="https://..."
                  placeholderTextColor="#9CA3AF"
                  className="text-white text-base py-2 flex-1"
                />
                <TouchableOpacity
                  onPress={() => {
                    const url = imageInput.trim();
                    if (url) {
                      setImages((prev) => [...prev, url]);
                      setImageInput("");
                    }
                  }}
                  className="bg-yellow-400 rounded-xl px-3 justify-center ml-2"
                >
                  <Text className="text-black font-bold">Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {images.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-6">
                {images.map((u) => (
                  <View key={u} className="flex-row items-center bg-white/10 border border-white/10 rounded-full px-3 py-1">
                    <Text className="text-white/85 mr-2" numberOfLines={1} style={{ maxWidth: 210 }}>
                      {u}
                    </Text>
                    <TouchableOpacity onPress={() => setImages((prev) => prev.filter((x) => x !== u))}>
                      <Text className="text-red-400 font-bold">✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              disabled={saving}
              onPress={onSave}
              className="bg-yellow-400 rounded-full items-center justify-center py-4 mb-10"
            >
              <Text className="text-black font-extrabold text-base">
                {saving ? "Saving..." : "Save Service"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
