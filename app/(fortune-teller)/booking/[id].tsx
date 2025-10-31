// app/(fortune-teller)/booking/[id].tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import BookingModal from "@/app/components/booking/popup";

// ---- Helpers ----
const addMinutes = (d: Date, mins: number) => new Date(d.getTime() + mins * 60000);
const toLocalDateLabel = (d: Date) =>
  d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
const toLocalTimeLabel = (d: Date) =>
  d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
// ส่งเป็น UTC ISO "Z"
const toISOZ = (d: Date) => d.toISOString();


// ---- Axios (ในไฟล์เดียว) ----
const ACCESS_TOKEN_KEY = "access_token";
const computeBaseURL = () => {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env;
  // @ts-ignore
  const { Platform } = require("react-native");
  return Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";
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

// ---- Minute stepper (อัปเดตเป็น -10m / -1m / +1m / +10m) ----
function TimeStepper({ date, onChange }: { date: Date; onChange: (d: Date) => void }) {
  const incMin = (step: number) => {
    const next = new Date(date);
    next.setMinutes(next.getMinutes() + step);
    next.setSeconds(0, 0);
    onChange(next);
  };
  return (
    <View className="flex-row items-center justify-between bg-primary-100 rounded-2xl p-3">
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => incMin(-10)}>
          <Text className="text-white/90">-10m</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => incMin(-1)}>
          <Text className="text-white/90">-1m</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-alabaster text-lg font-semibold">
        {String(date.getHours()).padStart(2, "0")}:{String(date.getMinutes()).padStart(2, "0")}
      </Text>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => incMin(+1)}>
          <Text className="text-white/90">+1m</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => incMin(+10)}>
          <Text className="text-white/90">+10m</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---- Page ----
export default function TimeSlotEditor() {
  const router = useRouter();
  // params: id ("new" | slotId), serviceId, serviceName จาก push ที่หน้า dashboard
  const { id, serviceId, serviceName } = useLocalSearchParams<{
    id: string;
    serviceId?: string;
    serviceName?: string;
  }>();

  // form states
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15);
    return d;
  });
  const [duration, setDuration] = useState<number>(30);
  const [showDatePopup, setShowDatePopup] = useState(false);

  // โหมดแก้ไข (ถ้ามี)
  useEffect(() => {
    if (id && id !== "new") {
      // TODO: GET /time-slots/{id} ถ้าต้องการ preload
    }
  }, [id]);

  const endTime = useMemo(() => addMinutes(date, duration), [date, duration]);

  // กดย้อน/ไป วัน
  const shiftDay = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d);
  };

  // รับวันที่จาก popup (รูปแบบ "DD / MM / YYYY+543")
  const applyThaiDisplayToDate = (thaiDisplay: string) => {
    const parts = thaiDisplay.split("/").map((s) => s.trim());
    const dd = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10) - 1;
    const yyyyBE = parseInt(parts[2], 10);
    const yyyy = yyyyBE - 543; // แปลง พ.ศ. -> ค.ศ.
    const next = new Date(date);
    next.setFullYear(yyyy, mm, dd);
    setDate(next);
  };

  // ✅ เพิ่ม 5 และ 10 นาทีเข้ามาด้วย
  const Durations = [5, 10, 15, 20, 30, 45, 60];

  const onCreate = useCallback(async () => {
    if (!serviceId) {
      Alert.alert("กรอกไม่ครบ", "ไม่พบ Service ที่เลือก");
      return;
    }
    const payload = {
      StartTime: toISOZ(date),
      EndTime: toISOZ(endTime),
      Status: "AVAILABLE" as const,
      ServiceID: String(serviceId),
      // ไม่ต้องส่งราคา/หรือ FortuneTellerID — ราคาอยู่ใน Service, ส่วน FortuneTellerID ให้ backend ผูกจาก JWT
    };

    try {
      await api.post("/time-slots", payload);
      Alert.alert("สำเร็จ", "สร้าง Time Slot เรียบร้อย", [
        { text: "ตกลง", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const status = e?.response?.status;
      const message = e?.response?.data?.message || e?.message || "ไม่สามารถสร้าง Time Slot ได้";
      if (status === 409) {
        Alert.alert(
          "เวลาชนกัน",
          typeof message === "string"
            ? message
            : "ช่วงเวลานี้ทับกับ Time Slot เดิม กรุณาเลือกเวลาอื่น"
        );
      } else {
        Alert.alert("เกิดข้อผิดพลาด", String(message));
      }
    }
  }, [serviceId, date, endTime, router]);

  const onSaveEdit = useCallback(async () => {
    try {
      // await api.patch(`/time-slots/${id}`, { ... });
      Alert.alert("บันทึกแล้ว", "แก้ไข Time Slot เรียบร้อย", [
        { text: "ตกลง", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("เกิดข้อผิดพลาด", e?.message ?? "บันทึกไม่สำเร็จ");
    }
  }, [id, router]);

  return (
    <ScreenWrapper>
      <HeaderBar title={id === "new" ? "Create Time Slot" : "Edit Time Slot"} showChat showBack />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8 }}>
        {/* Service (read-only จาก params) */}
        <Text className="text-white/70 mb-2">Service</Text>
        <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10">
          <Text className="text-alabaster font-semibold">
            {serviceName ? String(serviceName) : serviceId ? `Service ID: ${serviceId}` : "-"}
          </Text>
        </View>

        {/* วันที่ */}
        <Text className="text-white/70 mb-2">Date</Text>
        <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10 flex-row items-center justify-between">
          <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => shiftDay(-1)}>
            <MaterialIcons name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowDatePopup(true)} activeOpacity={0.8}>
            <Text className="text-alabaster text-base font-semibold">{toLocalDateLabel(date)}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => shiftDay(1)}>
            <MaterialIcons name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* เวลาเริ่ม (ปุ่มเป็น -10m / -1m / +1m / +10m) */}
        <Text className="text-white/70 mb-2">Time</Text>
        <TimeStepper date={date} onChange={setDate} />
        <View className="h-3" />

        {/* ระยะเวลา (มี 5 และ 10 นาทีเพิ่มแล้ว) */}
        <Text className="text-white/70 mb-2">Service time</Text>
        <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10 flex-row flex-wrap gap-2">
          {Durations.map((m) => {
            const active = duration === m;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setDuration(m)}
                className={`px-3 py-2 rounded-xl border ${
                  active ? "bg-yellow-400/20 border-yellow-400" : "bg-white/5 border-white/10"
                }`}
              >
                <Text className={`${active ? "text-yellow-300" : "text-white/85"} font-medium`}>{m} นาที</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* สรุป (ไม่มีราคา) */}
        <View className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
          <Text className="text-white/80">
            Start: <Text className="font-semibold">{toLocalDateLabel(date)} {toLocalTimeLabel(date)}</Text>
          </Text>
          <Text className="text-white/80 mt-1">
            End: <Text className="font-semibold">{toLocalTimeLabel(endTime)}</Text>
          </Text>
          <Text className="text-white/80 mt-1">
            Service: <Text className="font-semibold">{serviceName ?? "-"}</Text>
          </Text>
        </View>

        {/* CTA */}
        {id === "new" ? (
          <TouchableOpacity onPress={onCreate} className="bg-yellow-400 rounded-full items-center justify-center py-4 mb-10">
            <Text className="text-black font-extrabold text-base">Create Time Slot</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onSaveEdit} className="bg-yellow-400 rounded-full items-center justify-center py-4 mb-10">
            <Text className="text-black font-extrabold text-base">Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Popup เลือกวันแบบไทย */}
      <BookingModal
        visible={showDatePopup}
        onClose={() => setShowDatePopup(false)}
        teller={{ id: "creator", name: "TimeSlotCreator" }}
        onSelect={(thaiDate /* "DD / MM / YYYY+543" */) => {
          applyThaiDisplayToDate(thaiDate);
          setShowDatePopup(false);
        }}
      />
    </ScreenWrapper>
  );
}
