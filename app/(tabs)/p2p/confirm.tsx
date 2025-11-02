import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const getBaseURL = () => "https://softdev-horahub-backend-production.up.railway.app";

type ServiceDetail = {
  ServiceID: string;
  Service_name: string;
  Service_Description: string;
  Price: number;
  ImageURLs?: string[];
};

export default function ConfirmWalletPayment() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    serviceId?: string;
    customerId?: string;
    slotId?: string;
    fortuneTellerName?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [service, setService] = useState<ServiceDetail | null>(null);

  const serviceId = params.serviceId || "";
  const slotId = params.slotId || "";
  const customerId = params.customerId || "";
  const fortuneTellerName = params.fortuneTellerName || "หมอดูไม่ระบุ";

  const priceBaht = service?.Price || 0;
  const serviceName = service?.Service_name || "บริการ";

  // ✅ โหลดข้อมูล service และ wallet
  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync("access_token");
        if (!t) {
          Alert.alert("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนชำระเงิน", [
            { text: "เข้าสู่ระบบ", onPress: () => router.replace("/profile") },
          ]);
          return;
        }
        setToken(t);

        // โหลดข้อมูล wallet และ service พร้อมกัน
        const [balRes, svcRes] = await Promise.all([
          axios.get(`${getBaseURL()}/accounting/customer/me`, {
            headers: { Authorization: `Bearer ${t}` },
          }),
          axios.get(`${getBaseURL()}/services/${serviceId}`),
        ]);

        setBalance(balRes.data?.Balance_Number ?? 0);
        setService(svcRes.data);
      } catch (err) {
        console.log("Error loading data:", err);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId]);


  // ✅ กดชำระเงิน
  const handleConfirmPayment = async () => {
    if (!token) return Alert.alert("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
    if (balance === null) return Alert.alert("กำลังโหลดข้อมูลบัญชี...");
    if (balance < priceBaht)
      return Alert.alert("ยอดเงินไม่เพียงพอ", "กรุณาเติมเงินก่อนชำระเงิน");

    try {
      setLoading(true);

      // 1️⃣ สร้าง order ก่อน
      await axios.post(
        `${getBaseURL()}/orders`,
        {
          ServiceID: serviceId,
          TimeslotID: slotId,
          UserID: customerId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2️⃣ ดึงข้อมูล service เพื่อนำ UserID ของหมอดู
      const svcRes = await axios.get(`${getBaseURL()}/services/${serviceId}`);
      const fortuneTellerUserId = svcRes.data?.FortuneTeller?.UserID || null;

      if (fortuneTellerUserId) {
        // 3️⃣ ดึงรายชื่อแชตทั้งหมดของผู้ใช้คนนี้
        const chatRes = await axios.get(`${getBaseURL()}/chat-conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const existing = (chatRes.data || []).find((conv: any) =>
          conv.Participants?.some(
            (p: any) => p.UserID === fortuneTellerUserId
          )
        );

        // 4️⃣ ถ้ายังไม่เคยคุยกับหมอดูนี้ → สร้างห้องใหม่
        if (!existing) {
          await axios.post(
            `${getBaseURL()}/chat-conversations`,
            { participantUserIDs: [fortuneTellerUserId] },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          //console.log("✅ ห้องแชตใหม่ถูกสร้างเรียบร้อย");
        } else {
          //console.log("ℹ️ พบห้องแชตเดิมอยู่แล้ว ไม่สร้างซ้ำ");
        }
      }

      // 5️⃣ แจ้งสำเร็จ
      Alert.alert("สำเร็จ", "การจองของคุณเสร็จสมบูรณ์", [
        { text: "ตกลง", onPress: () => router.replace("/(tabs)/p2p/mybooking/mybooking") },
      ]);
    } catch (error: any) {
      console.error("Order error:", error?.message || error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถสร้างคำสั่งซื้อหรือห้องแชตได้");
    } finally {
      setLoading(false);
    }
  };


  // ✅ กำลังโหลด
  if (loading)
    return (
      <View className="flex-1 bg-[#0E0B1B] justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4">กำลังโหลด...</Text>
      </View>
    );

  if (!service)
    return (
      <ScreenWrapper>
        <HeaderBar title="Payment" showBack />
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">ไม่พบบริการ</Text>
        </View>
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <HeaderBar title="Payment" showBack onBackPress={() => router.back()} />
      <ScrollView
        className="flex-1 bg-[#0E0B1B]"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >

        <View className="bg-[#1F1C23] border border-white/10 rounded-2xl p-4 mb-4">
          <Text className="text-white font-bold text-lg mb-3">
            หมอดู: {fortuneTellerName}
          </Text>
          <View className="flex-row items-center">
            <Image
              source={{
                uri:
                  service.ImageURLs?.[0] ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png",
              }}
              className="w-16 h-16 rounded-lg"
            />
            <View className="flex-1 ml-4">
              <Text className="text-white/90">{serviceName}</Text>
              <Text className="text-yellow-400 font-bold mt-1">
                ฿ {priceBaht.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-[#1F1C23] border border-white/10 rounded-2xl px-4 py-3 flex-row justify-between mb-6">
          <Text className="text-white">ยอดเงินใน Wallet</Text>
          <Text className="text-yellow-400 font-bold">
            {balance?.toFixed(2)} บาท
          </Text>
        </View>

        <View className="bg-[#2A2631] border border-white/10 rounded-2xl p-4 mb-6">
          <Text className="text-white font-bold text-lg mb-2">
            สรุปรายการชำระเงิน
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/70">ชื่อบริการ</Text>
            <Text className="text-white">{service.Service_name}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/70">หมอดู</Text>
            <Text className="text-white">{fortuneTellerName}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/70">จำนวนเงินที่ต้องชำระ</Text>
            <Text className="text-yellow-400 font-bold">
              ฿ {priceBaht.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between border-t border-white/10 mt-3 pt-3">
            <Text className="text-white font-bold">ยอดคงเหลือหลังชำระ</Text>
            <Text className="text-green-400 font-bold">
              ฿ {(balance! - priceBaht).toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirmPayment}
          className="bg-purple-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            ยืนยันการชำระเงิน
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
