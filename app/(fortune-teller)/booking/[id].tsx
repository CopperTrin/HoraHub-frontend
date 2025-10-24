import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";

// ⬇️ เพิ่ม import popup
import BookingModal from "@/app/components/booking/popup";

// ---- Types ----
type ServiceCategory = { id: string; name: string };

// ---- Mock services ----
const myServices: ServiceCategory[] = [
  { id: "service-uuid-001", name: "ไพ่ทาโรต์" },
  { id: "service-uuid-002", name: "โหราศาสตร์ไทย" },
  { id: "service-uuid-003", name: "ดูดวงเบอร์โทรศัพท์" },
];

// ---- Helpers ----
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toLocalDateLabel = (d: Date) =>
  d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
const toLocalTimeLabel = (d: Date) =>
  d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
const addMinutes = (d: Date, mins: number) => new Date(d.getTime() + mins * 60000);
const toISOZ = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();

// ---- Minute stepper ----
function TimeStepper({ date, onChange }: { date: Date; onChange: (d: Date) => void }) {
  const inc = (k: "hour" | "min", step: number) => {
    const next = new Date(date);
    if (k === "hour") next.setHours(next.getHours() + step);
    else next.setMinutes(next.getMinutes() + step);
    next.setSeconds(0, 0);
    onChange(next);
  };
  return (
    <View className="flex-row items-center justify-between bg-primary-100 rounded-2xl p-3">
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => inc("hour", -1)}>
          <Text className="text-white/90">-1h</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => inc("min", -15)}>
          <Text className="text-white/90">-15m</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-alabaster text-lg font-semibold">
        {String(date.getHours()).padStart(2, "0")}:{String(date.getMinutes()).padStart(2, "0")}
      </Text>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => inc("min", +15)}>
          <Text className="text-white/90">+15m</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => inc("hour", +1)}>
          <Text className="text-white/90">+1h</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---- Page ----
export default function TimeSlotEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // "new" | real-id

  // form states
  const [service, setService] = useState<ServiceCategory | null>(myServices[0]);
  const [price, setPrice] = useState<string>("300");
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15);
    return d;
  });
  const [duration, setDuration] = useState<number>(30);

  // ⬇️ state สำหรับเปิด/ปิด popup
  const [showDatePopup, setShowDatePopup] = useState(false);

  // สำหรับโหมดแก้ไข
  useEffect(() => {
    if (id && id !== "new") {
      // TODO: load slot detail
    }
  }, [id]);

  const endTime = useMemo(() => addMinutes(date, duration), [date, duration]);

  const onCreate = async () => {
    if (!service) return Alert.alert("กรอกไม่ครบ", "กรุณาเลือกบริการ");
    const payload = {
      StartTime: toISOZ(date),
      EndTime: toISOZ(endTime),
      ServiceID: service.id,
      Price: Number(price || 0),
    };
    try {
      console.log("POST /time-slots", payload);
      Alert.alert("สำเร็จ", "สร้าง Time Slot เรียบร้อย");
      router.back();
    } catch (e: any) {
      Alert.alert("เกิดข้อผิดพลาด", e?.message ?? "ไม่สามารถสร้าง Time Slot ได้");
    }
  };

  const onSaveEdit = async () => {
    try {
      Alert.alert("บันทึกแล้ว", "แก้ไข Time Slot เรียบร้อย");
      router.back();
    } catch (e: any) {
      Alert.alert("เกิดข้อผิดพลาด", e?.message ?? "บันทึกไม่สำเร็จ");
    }
  };

  // เลื่อนวันด้วยลูกศร
  const shiftDay = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d);
  };

  // ⬇️ แปลงวันที่แบบไทยจาก popup -> ตั้งค่าที่ state โดยคง "เวลา" เดิม
  const applyThaiDisplayToDate = (thaiDisplay: string) => {
    // thaiDisplay format: "DD / MM / YYYY(BE)"
    const parts = thaiDisplay.split("/").map((s) => s.trim());
    const dd = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10) - 1;
    const yyyyBE = parseInt(parts[2], 10);
    const yyyy = yyyyBE - 543; // แปลง พ.ศ. -> ค.ศ.

    const next = new Date(date);
    next.setFullYear(yyyy, mm, dd);
    setDate(next);
  };

  const Durations = [15, 20, 30, 45, 60];

  return (
    <ScreenWrapper>
      <HeaderBar title={id === "new" ? "Create Time Slot" : "Edit Time Slot"} showChat showBack/>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8 }}>
        {/* Service selector */}
        <Text className="text-white/70 mb-2">บริการ</Text>
        <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10">
          <View className="flex-row flex-wrap gap-2">
            {myServices.map((s) => {
              const active = service?.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setService(s)}
                  className={`px-3 py-2 rounded-xl border ${
                    active ? "bg-yellow-400/20 border-yellow-400" : "bg-white/5 border-white/10"
                  }`}
                >
                  <Text className={`${active ? "text-yellow-300" : "text-white/80"} font-medium`}>{s.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date */}
        <Text className="text-white/70 mb-2">วันที่</Text>
        <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10 flex-row items-center justify-between">
          <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => shiftDay(-1)}>
            <MaterialIcons name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>

          {/* ⬇️ กดที่ตัววันที่เพื่อเปิด popup */}
          <TouchableOpacity onPress={() => setShowDatePopup(true)} activeOpacity={0.8}>
            <Text className="text-alabaster text-base font-semibold">{toLocalDateLabel(date)}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl" onPress={() => shiftDay(1)}>
            <MaterialIcons name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Start time */}
        <Text className="text-white/70 mb-2">เวลาเริ่ม</Text>
        <TimeStepper date={date} onChange={setDate} />
        <View className="h-3" />

        {/* Duration */}
        <Text className="text-white/70 mb-2">ระยะเวลา</Text>
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

        {/* Price */}
        <Text className="text-white/70 mb-2">ราคา (บาท)</Text>
        <View className="bg-primary-100 rounded-2xl px-3 py-2 mb-6 border border-white/10">
          <TextInput
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholder="เช่น 300"
            placeholderTextColor="#9CA3AF"
            className="text-alabaster text-base py-2"
          />
        </View>

        {/* Summary */}
        <View className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
          <Text className="text-white/80">
            เริ่ม: <Text className="font-semibold">{toLocalDateLabel(date)} {toLocalTimeLabel(date)}</Text>
          </Text>
          <Text className="text-white/80 mt-1">
            สิ้นสุด: <Text className="font-semibold">{toLocalTimeLabel(endTime)}</Text>
          </Text>
          <Text className="text-white/80 mt-1">
            บริการ: <Text className="font-semibold">{service?.name ?? "-"}</Text>
          </Text>
          <Text className="text-white/80 mt-1">
            ราคา: <Text className="font-semibold">฿{price || 0}</Text>
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

      {/* ⬇️ เรียกใช้ popup ของคุณ */}
      <BookingModal
        visible={showDatePopup}
        onClose={() => setShowDatePopup(false)}
        teller={{ id: "creator", name: "TimeSlotCreator" }}  // ให้ครบตาม type
        onSelect={(thaiDate /* "DD / MM / YYYY+543" */, _time) => {
          applyThaiDisplayToDate(thaiDate);
          setShowDatePopup(false);
        }}
      />
    </ScreenWrapper>
  );
}
