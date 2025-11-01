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
import { MaterialIcons } from "@expo/vector-icons";
import HeaderBar from "../../components/ui/HeaderBar";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import product_4 from "@/assets/images/product/4.png";
import product_5 from "@/assets/images/product/5.png";
import product_6 from "@/assets/images/product/6.png";

import prodile_img from "@/assets/images/product/fortune-teller/อาจารย์เเดง.jpg";

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
  Category?: {
    Category_name?: string;
  };
};

export default function FortuneTellerProfilePage() {
  const { id_fortune_teller, from_id } = useLocalSearchParams<{ id_fortune_teller?: string; from_id?: string }>();
  const [activeTab, setActiveTab] = useState<"shop" | "p2p">("shop");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FTProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [showFullBio, setShowFullBio] = useState(false);

  const mockProfile: FTProfile = {
    FortuneTellerID: "mock-red",
    UserID: "mock-user",
    Status: "active",
    Point: 1200,
    Bio: `อาจารย์แดงเป็นหมอดูผู้มีประสบการณ์ด้านโหราศาสตร์และฮวงจุ้ยกว่า 15 ปี 
ท่านเชี่ยวชาญด้านการเสริมดวง การตั้งศาล การจัดวางสิ่งของตามหลักพลังจักรวาล 
ลูกค้าที่มาดูส่วนใหญ่มักพบความเปลี่ยนแปลงในทางที่ดี ทั้งด้านการเงินและความรัก
พร้อมทั้งยังให้คำปรึกษาอย่างเป็นกันเอง เข้าใจง่าย และแม่นยำ`,
    User: {
      UserInfo: {
        FirstName: "อาจารย์แดง",
        LastName: "",
        PictureURL: "",
        Email: "ajarn.daeng@gmail.com",
      },
    },
  };

  const shopProducts = [
    { id: "4", name: "เครื่องรางของต่างประเทศ รวมชุด", price: 1800, image: product_4 },
    { id: "5", name: "น้ำเต้า", price: 299, image: product_5 },
    { id: "6", name: "ปี่เซียะมงคล", price: 1000, image: product_6 },
  ];

  useEffect(() => {
    const fetchProfile = async () => {

      if (!id_fortune_teller || id_fortune_teller === "mock" || id_fortune_teller === "null" || id_fortune_teller === "undefined") {
        setProfile(mockProfile);
        setLoading(false);
        return;
      }

      try {
        const token = await SecureStore.getItemAsync("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const resById = await axios.get(`${getBaseURL()}/fortune-teller/${id_fortune_teller}`, {
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
        setProfile(mockProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id_fortune_teller]);

  useEffect(() => {
    const fetchServices = async () => {
      if (!id_fortune_teller) return;
      try {
        const res = await axios.get(`${getBaseURL()}/services`);
        const all: Service[] = res.data || [];
        const filtered = all.filter((s) => s.FortuneTellerID === id_fortune_teller);
        setServices(filtered);
      } catch (err: any) {
        console.log("Error fetching services:", err?.message);
      }
    };
    fetchServices();
  }, [id_fortune_teller]);

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

  const avatar =
    profile?.User?.UserInfo?.PictureURL && profile?.User?.UserInfo?.PictureURL.startsWith("http")
      ? { uri: profile.User.UserInfo.PictureURL }
      : prodile_img;

  

  const onClickBack = () => {
    if (id_fortune_teller === "mock") {
      router.push(`/(tabs)/shop/${from_id || ""}`);
    } else {
      if(!from_id){
        router.push(`/(tabs)/home`);
      }else{
        router.push(`/(tabs)/p2p/service/${from_id || ""}`);
      }
    }
  };

  return (
    <ScreenWrapper>
      <View className="bg-primary-200 flex-row items-center justify-between px-5 h-16">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => onClickBack()} accessibilityLabel="ย้อนกลับ">
            <MaterialIcons name="arrow-back-ios-new" size={24} color="#F8F8F8" />
          </TouchableOpacity>

          <Text className="text-alabaster text-2xl font-semibold ml-2" numberOfLines={1}>
            {(() => {
              const rawTitle = profile?.User?.UserInfo?.FirstName || "หมอดู";
              const t = Array.from(rawTitle);
              return t.length > 20 ? `${t.slice(0, 20).join("")}...` : rawTitle;
            })()}
          </Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.push("/chat")}
            className="ml-4"
            accessibilityLabel="เปิดแชท"
          >
            <MaterialIcons name="chat-bubble-outline" size={24} color="#F8F8F8" />
          </TouchableOpacity>
        </View>
      </View>


      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
          paddingTop: 8,
        }}
      >
        
        <View className="flex-row items-center bg-primary-100 p-4 rounded-2xl mb-4">
          <Image source={avatar} className="w-20 h-20 rounded-full mr-4" />
          <View className="flex-1 gap-[2px]">
            <Text className="text-alabaster text-xl font-bold">
              {profile?.User?.UserInfo?.FirstName || "ไม่มีชื่อ"}{" "}
              {profile?.User?.UserInfo?.LastName || ""}
            </Text>
            <Text className="text-alabaster">{profile?.User?.UserInfo?.Email}</Text>
            <Text className="text-alabaster text-sm">{profile?.Point ?? 0} คะแนน</Text>
          </View>
        </View>

        {/* Bio */}
        {!!profile?.Bio && (
          <View className="mb-4">
            <Text
              className="text-alabaster"
              numberOfLines={showFullBio ? undefined : 4}
              ellipsizeMode="tail"
            >
              {profile.Bio}
            </Text>
            {profile.Bio.length > 120 && (
              <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)} className="mt-2">
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
            onPress={() => setActiveTab("shop")}
            className={`flex-1 py-3 items-center ${
              activeTab === "shop" ? "bg-accent-200" : ""
            }`}
          >
            <Text className={`font-bold ${activeTab === "shop" ? "text-black" : "text-alabaster"}`}>
              Shop
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("p2p")}
            className={`flex-1 py-3 items-center ${
              activeTab === "p2p" ? "bg-accent-200" : ""
            }`}
          >
            <Text className={`font-bold ${activeTab === "p2p" ? "text-black" : "text-alabaster"}`}>
              P2P
            </Text>
          </TouchableOpacity>
        </View>

        {/* แสดงบริการดูดวง */}
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
                  onPress={() => router.push(`/(tabs)/p2p/service/${service.ServiceID}`)}
                >
                  {service.ImageURLs?.length > 0 && (
                    <Image
                      source={{ uri: service.ImageURLs[0] }}
                      className="w-24 h-24 rounded-xl"
                      resizeMode="cover"
                    />
                  )}
                  <View className="flex-1 ml-4 justify-center">
                    {!!service.Category?.Category_name && (
                      <Text className="text-alabaster text-sm mt-0.5">
                        {service.Category.Category_name}
                      </Text>
                    )}
                    <Text className="text-accent-200 text-lg font-bold" numberOfLines={1}>
                      {service.Service_name}
                    </Text>
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

        {/*  สินค้าในร้าน */}
        {activeTab === "shop" && (
          <View className="flex-row flex-wrap justify-between mb-5">
            {shopProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-primary-100 rounded-xl overflow-hidden mb-3"
                style={{ width: "49%" }}
                onPress={() => router.push(`/(tabs)/shop/${item.id}`)}
              >
                <Image source={item.image} className="h-40 w-full" resizeMode="cover" />
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
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
