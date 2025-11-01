import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";

import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import BookingModal from "@/app/components/booking/popup";

const addMinutes = (d: Date, mins: number) => new Date(d.getTime() + mins * 60000);
const toLocalDateLabel = (d: Date) =>
  d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
const toLocalTimeLabel = (d: Date) =>
  d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  });
const toISOZ = (d: Date) => d.toISOString();

const ACCESS_TOKEN_KEY = "access_token";
const computeBaseURL = () => {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env;
  const { Platform } = require("react-native");
  return Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://127.0.0.1:3456";
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

export default function TimeSlotEditor() {
  const router = useRouter();
  const { id, serviceId, serviceName } = useLocalSearchParams<{
    id: string;
    serviceId?: string;
    serviceName?: string;
  }>();

  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15);
    return d;
  });
  const [duration, setDuration] = useState<number>(30);
  const [showDatePopup, setShowDatePopup] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const endTime = useMemo(() => addMinutes(date, duration), [date, duration]);

  const shiftDay = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d);
  };

  const applyThaiDisplayToDate = (thaiDisplay: string) => {
    const parts = thaiDisplay.split("/").map((s) => s.trim());
    const dd = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10) - 1;
    const yyyyBE = parseInt(parts[2], 10);
    const yyyy = yyyyBE - 543;
    const next = new Date(date);
    next.setFullYear(yyyy, mm, dd);
    setDate(next);
  };

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
    };

    try {
      await api.post("/time-slots", payload);
      Alert.alert("สำเร็จ", "สร้าง Time Slot เรียบร้อย", [
        {
          text: "ตกลง",
          onPress: () => {
            router.replace(`/(fortune-teller)/booking/service/${serviceId}`);
            setTimeout(() => router.replace(`/(fortune-teller)/booking/service/${serviceId}`), 400);
          },
        },
      ]);
    } catch (e: any) {
      const status = e?.response?.status;
      const message =
        e?.response?.data?.message || e?.message || "ไม่สามารถสร้าง Time Slot ได้";
      if (status === 409) {
        Alert.alert("เวลาชนกัน", "ช่วงเวลานี้ทับกับ Time Slot เดิม กรุณาเลือกเวลาอื่น");
      } else {
        Alert.alert("เกิดข้อผิดพลาด", String(message));
      }
    }
  }, [serviceId, date, endTime, router]);

  return (
    <ScreenWrapper>
      <HeaderBar title={id === "new" ? "Create Time Slot" : "Edit Time Slot"} showChat showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8 }}>
        {/* Service */}
        <Text className="text-white/70 mb-2">Service</Text>
        <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10">
          <Text className="text-alabaster font-semibold">
            {serviceName ?? `Service ID: ${serviceId}`}
          </Text>
        </View>

        <Text className="text-white/70 mb-2">Date</Text>
        <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10 flex-row items-center justify-between">
          <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => shiftDay(-1)}>
            <MaterialIcons name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowDatePopup(true)}>
            <Text className="text-alabaster text-base font-semibold">{toLocalDateLabel(date)}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => shiftDay(1)}>
            <MaterialIcons name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text className="text-white/70 mb-2">Start Time</Text>
        <View className="bg-primary-100 rounded-2xl p-4 mb-4 border border-white/10">

          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
            className="items-center mb-3"
          >
            <Text className="text-alabaster text-2xl font-bold">
              {toLocalTimeLabel(date)}
            </Text>
          </TouchableOpacity>

          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              className="bg-white/10 px-3 py-2 rounded-xl mb-2"
              onPress={() => {
                const next = new Date(date);
                next.setHours(next.getHours() - 1);
                setDate(next);
              }}
            >
              <Text className="text-white/90">-1hr</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/10 px-3 py-2 rounded-xl mb-2"
              onPress={() => {
                const next = new Date(date);
                next.setMinutes(next.getMinutes() - 10);
                setDate(next);
              }}
            >
              <Text className="text-white/90">-10m</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/10 px-3 py-2 rounded-xl mb-2"
              onPress={() => {
                const next = new Date(date);
                next.setMinutes(next.getMinutes() - 1);
                setDate(next);
              }}
            >
              <Text className="text-white/90">-1m</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/10 px-3 py-2 rounded-xl mb-2"
              onPress={() => {
                const next = new Date(date);
                next.setMinutes(next.getMinutes() + 1);
                setDate(next);
              }}
            >
              <Text className="text-white/90">+1m</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/10 px-3 py-2 rounded-xl mb-2"
              onPress={() => {
                const next = new Date(date);
                next.setMinutes(next.getMinutes() + 10);
                setDate(next);
              }}
            >
              <Text className="text-white/90">+10m</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/10 px-3 py-2 rounded-xl mb-2"
              onPress={() => {
                const next = new Date(date);
                next.setHours(next.getHours() + 1);
                setDate(next);
              }}
            >
              <Text className="text-white/90">+1hr</Text>
            </TouchableOpacity>
          </View>

        </View>

        {showTimePicker && (
          <View className="absolute inset-0 bg-black/40 items-center justify-center z-50">
            {Platform.OS === "ios" ? (
              <View className="bg-white rounded-2xl p-3 w-80 items-center justify-center">
                <DateTimePicker
                  value={date}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  themeVariant="light"
                  textColor="black"
                  onChange={(_, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              </View>
            ) : (
              <View className="bg-white rounded-2xl p-4 w-80 items-center justify-center">
                <DateTimePicker
                  value={date}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(_, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              </View>
            )}
          </View>
        )}


        <Text className="text-white/70 mb-2">Duration</Text>
        <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10 flex-row flex-wrap gap-2">
          {[5, 10, 15, 20, 30, 45, 60 , 90].map((m) => {
            const active = duration === m;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setDuration(m)}
                className={`px-3 py-2 rounded-xl border ${
                  active ? "bg-yellow-400/20 border-yellow-400" : "bg-white/5 border-white/10"
                }`}
              >
                <Text className={`${active ? "text-yellow-300" : "text-white/85"} font-medium`}>
                  {m} นาที
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="bg-[#1E1633] rounded-2xl p-5 mb-6 border border-white/10">
          <Text className="text-white/90 font-semibold text-lg mb-2 text-center">
            {toLocalDateLabel(date)}
          </Text>
          <View className="flex-row justify-between mt-2">
            <Text className="text-white/80">เริ่ม</Text>
            <Text className="text-yellow-300 font-bold">{toLocalTimeLabel(date)}</Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-white/80">สิ้นสุด</Text>
            <Text className="text-yellow-300 font-bold">{toLocalTimeLabel(endTime)}</Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-white/80">บริการ</Text>
            <Text className="text-yellow-300 font-bold">{serviceName ?? "-"}</Text>
          </View>
        </View>

        {id === "new" && (
          <TouchableOpacity
            onPress={onCreate}
            className="bg-yellow-400 rounded-full items-center justify-center py-4 mb-10"
          >
            <Text className="text-black font-extrabold text-base">Create Time Slot</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BookingModal
        visible={showDatePopup}
        onClose={() => setShowDatePopup(false)}
        teller={{ id: "creator", name: "TimeSlotCreator" }}
        onSelect={(thaiDate) => {
          applyThaiDisplayToDate(thaiDate);
          setShowDatePopup(false);
        }}
      />
    </ScreenWrapper>
  );
}
