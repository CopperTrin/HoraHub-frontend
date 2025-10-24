import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


const getBaseURL = () =>
  Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";

type FTProfile = {
  FortuneTellerID: string;
  UserID: string;
  Status: string;
  CVURL?: string;
  Point?: number;
  Bio?: string;
  User?: {
    UserInfo?: {
      FirstName?: string;
      LastName?: string;
      PictureURL?: string;
      Email?: string;
    };
  };
};

type Service = {
  ServiceID: string;
  Service_name: string;
  Service_Description: string;
  Price: number;
  ImageURLs: string[];
  FortuneTellerID: string;
  Avg_Rating: number;
};

export default function FortuneTellerProfilePage() {
  const [activeTab, setActiveTab] = useState<"shop" | "p2p">("p2p");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FTProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [showFullBio, setShowFullBio] = useState(false);

  const mock_id = "b26e0dc5-d7ef-4fcf-b711-cf9348a4a741"; // mock FT id

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const resById = await axios.get(`${getBaseURL()}/fortune-teller/${mock_id}`, {
          headers,
        });
        const ftById = resById.data;
        setProfile(ftById);

        if (ftById?.UserID) {
          const resByUser = await axios.get(
            `${getBaseURL()}/fortune-teller/user/${ftById.UserID}`,
            { headers }
          );
          const ftByUser = resByUser.data;
          setProfile({
            ...ftById,
            ...ftByUser,
            User: ftByUser.User ?? ftById.User,
          });
        }
      } catch (err: any) {
        console.log("Error fetching fortune teller:", err?.message);
        Alert.alert("ไม่สามารถโหลดข้อมูลหมอดูได้", "โปรดลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 ดึงบริการ (services) ของหมอดูคนนี้
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${getBaseURL()}/services`);
        const all: Service[] = res.data || [];
        const filtered = all.filter((s) => s.FortuneTellerID === mock_id);
        setServices(filtered);
      } catch (err: any) {
        console.log("Error fetching services:", err?.message);
      }
    };
    fetchServices();
  }, []);

  const shopProducts = [
    {
      id: 1,
      name: "ปี่เซียะ วัตถุมงคลจีนยอดนิยม",
      price: 100,
      img: "https://www.central.co.th/e-shopping/wp-content/uploads/2024/10/good-luck-amulet-2.jpg",
    },
    {
      id: 2,
      name: "กำไลนำโชค",
      price: 850,
      img: "https://www.central.co.th/e-shopping/wp-content/uploads/2024/10/good-luck-amulet-3.jpg",
    },
    {
      id: 3,
      name: "บูชา ‘องค์ท้าวเวสสุวรรณ’ ปัดเป่าสิ่งเลวร้าย",
      price: 690,
      img: "https://www.central.co.th/e-shopping/wp-content/uploads/2020/12/4-TAO-WESSUWAN1.jpg",
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-200">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-3 font-sans-semibold">
          กำลังโหลดข้อมูลหมอดู...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-200">
        <Text className="text-white font-sans-semibold">ไม่พบข้อมูลหมอดู</Text>
      </View>
    );
  }

  const avatar =
    profile?.User?.UserInfo?.PictureURL ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfgSRfv0BYIwiTZpoQk3rKrDFnaSHimR1pvQ&s";

  return (
    <ScreenWrapper>
      <HeaderBar
        title={profile?.User?.UserInfo?.FirstName || "หมอดู"}
        showChat
        showBack
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
          paddingTop: 8,
        }}
      >
        {/* Profile */}
        <View className="flex-row items-center bg-primary-100 p-4 rounded-2xl mb-4">
          <Image source={{ uri: avatar }} className="w-20 h-20 rounded-full mr-4" />
          <View className="flex-1 gap-[2px]">
            <Text className="text-alabaster text-xl font-bold">
              {profile?.User?.UserInfo?.FirstName || "ไม่มีชื่อ"}{" "}
              {profile?.User?.UserInfo?.LastName || ""}
            </Text>
            <Text className="text-alabaster">{profile?.User?.UserInfo?.Email}</Text>
            <Text className="text-alabaster text-sm">
              {profile?.Point ?? 0} คะแนน
            </Text>
          </View>
        </View>

        {/* Bio */}
        {!!profile?.Bio && (
          <View className="mb-4">
            <Text
              className="text-alabaster"
              numberOfLines={showFullBio ? undefined : 5}
              ellipsizeMode="tail"
              style={{ whiteSpace: "pre-line" as any }}
            >
              {profile.Bio}
            </Text>
            {profile.Bio.split("\n").length > 5 && (
              <TouchableOpacity
                onPress={() => setShowFullBio(!showFullBio)}
                className="mt-2"
              >
                <Text className="text-accent-200 font-sans-semibold">
                  {showFullBio ? "See less ▲" : "See more ▼"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tabs */}
        <View className="flex-row bg-primary-100 rounded-full overflow-hidden mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab("p2p")}
            className={`flex-1 py-3 items-center ${
              activeTab === "p2p" ? "bg-accent-200" : ""
            }`}
          >
            <Text
              className={`font-bold ${
                activeTab === "p2p" ? "text-black" : "text-alabaster"
              }`}
            >
              P2P
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("shop")}
            className={`flex-1 py-3 items-center ${
              activeTab === "shop" ? "bg-accent-200" : ""
            }`}
          >
            <Text
              className={`font-bold ${
                activeTab === "shop" ? "text-black" : "text-alabaster"
              }`}
            >
              Shop
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🧿 P2P Services */}
        {activeTab === "p2p" && (
          <View className="space-y-3">
            {services.length === 0 ? (
              <Text className="text-alabaster text-center">
                หมอดูยังไม่มีบริการดูดวงในขณะนี้
              </Text>
            ) : (
              services.map((service) => (
                <TouchableOpacity
                  key={service.ServiceID}
                  className="bg-primary-100 rounded-2xl flex-row items-center p-2 mb-2"
                  onPress={() => router.push(`/(tabs)/p2p/${service.ServiceID}`)}
                >
                  {/* รูปบริการ */}
                  {service.ImageURLs?.length > 0 && (
                    <Image
                      source={{ uri: service.ImageURLs[0] }}
                      className="w-24 h-24 rounded-xl"
                      resizeMode="cover"
                    />
                  )}

                  {/* ข้อมูลบริการ */}
                  <View className="flex-1 ml-4 justify-center">

                    {/* ชื่อหมวดหมู่ */}
                    {!!service.Category?.Category_name && (
                      <Text className="text-alabaster  text-sm mt-0.5">
                        {service.Category.Category_name}
                      </Text>
                    )}

                    {/* ชื่อบริการ */}
                    <Text
                      className="text-accent-200 text-lg font-bold"
                      numberOfLines={1}
                    >
                      {service.Service_name}
                    </Text>

                    {/* เรด + ราคา อยู่ในบรรทัดเดียวกัน */}
                    <View className="flex-row justify-between items-center mt-1">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="star" size={16} color="#FFD700" /> 
                        <Text className="text-accent-200 text-base font-bold">
                          {service.Avg_Rating != null ? service.Avg_Rating.toFixed(1) : "-"}
                        </Text>
                      </View>
                      <Text className="text-accent-200 text-lg font-bold">
                        ฿{service.Price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}


        {activeTab === "shop" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <View className="flex-row flex-wrap justify-between">
              {shopProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-primary-100 rounded-xl overflow-hidden mb-3"
                  style={{ width: "49%" }}
                  onPress={() => router.push(`/(tabs)/shop/${item.id}`)}
                >
                  <Image
                    source={{ uri: item.img }}
                    className="h-40 w-full"
                    resizeMode="cover"
                  />
                  <View className="p-3 flex-col justify-between" style={{ minHeight: 84 }}>
                    <Text className="text-alabaster" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text className="text-accent-200 font-bold text-right text-xl">
                      ฿{item.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
