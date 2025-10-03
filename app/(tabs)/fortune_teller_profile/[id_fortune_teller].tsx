import React, { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";
import { router } from "expo-router";

export default function FortuneTellerProfilePage() {
  const [activeTab, setActiveTab] = useState<"shop" | "p2p">("shop");

  const profile = {
    id:1,
    name: "อาจารย์เเดง",
    email: "ajarndaeng@gmail.com",
    views: 69,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfgSRfv0BYIwiTZpoQk3rKrDFnaSHimR1pvQ&s",
    bio: "หมอดูผู้เชี่ยวชาญ ด้านการทำนายรักเงิน และสัญชาตญาณ มีความสามารถในการกระตุ้นกำลังใจ และให้คำแนะนำเชิงบวก",
  };

  const shopProducts = [
    { id: 1, name: "พระเครื่อง", price: 1000, img: "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5LJPy5B4qNdayFGtRrSsdJInLYWvwGnX9BVjkAUMd0O7l7CLSTW.webp" },
    { id: 2, name: "พระเครื่อง", price: 1000, img: "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5LJPy5B4qNdayFGtRrSsdJInLYWvwGnX9BVjkAUMd0O7l7CLSTW.webp" },
    { id: 3, name: "พระเครื่อง", price: 1000, img: "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5LJPy5B4qNdayFGtRrSsdJInLYWvwGnX9BVjkAUMd0O7l7CLSTW.webp" },
  ];

  const p2pServices = [
    { id: 1, title: "ความรัก", price: "฿10.00 / นาที" },
    { id: 2, title: "การเงิน", price: "฿10.00 / นาที" },
    { id: 3, title: "การงาน", price: "฿10.00 / นาที" },
  ];

  const schedule = [
    { id: 1, date: "วันอังคาร 25 สิงหาคม 2568", times: ["12:00 - 12:30", "12:00 - 12:30", "12:00 - 12:30"] },
    { id: 2, date: "วันอังคาร 25 สิงหาคม 2568", times: ["12:00 - 12:30", "12:00 - 12:30" , "12:00 - 12:30", "12:00 - 12:30"] },
    { id: 3, date: "วันอังคาร 25 สิงหาคม 2568", times: ["12:00 - 12:30"] },
  ];

  return (
    <ScreenWrapper>
      <HeaderBar title="อาจารย์เเดง" showChat showBack />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
          paddingTop: 8,
        }}
      >
        {/* Profile */}
        <View className="flex-row items-center bg-primary-100 p-4 rounded-2xl mb-4">
          <Image
            source={{ uri: profile.image }}
            className="w-20 h-20 rounded-full mr-4"
          />
          <View className="flex-1 gap-[2px]">
            <Text className="text-alabaster text-xl font-bold">{profile.name}</Text>
            <Text className="text-alabaster">{profile.email}</Text>
            <Text className="text-alabaster text-sm">ดูแล้ว {profile.views} ครั้ง</Text>
          </View>
        </View>

        {/* Bio */}
        <Text className="text-alabaster mb-4">{profile.bio}</Text>

        {/* Tabs */}
        <View className="flex-row bg-primary-100 rounded-full overflow-hidden mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab("shop")}
            className={`flex-1 py-3  items-center ${activeTab === "shop" ? "bg-accent-200" : ""}`}
          >
            <Text className={`font-bold ${activeTab === "shop" ? "" : "text-alabaster"}`}>Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("p2p")}
            className={`flex-1 py-3 items-center ${activeTab === "p2p" ? "bg-accent-200" : ""}`}
          >
            <Text className={`font-bold  ${activeTab === "p2p" ? "" : "text-alabaster"}`}>P2P</Text>
          </TouchableOpacity>
        </View>

        {/* Shop Tab */}
        {activeTab === "shop" && (
        <ScrollView
            contentContainerStyle={{
            paddingBottom: 20,
            }}
        >
            <View className="flex-row flex-wrap justify-between">
            {shopProducts.map((item) => (
                <TouchableOpacity
                key={item.id}
                className="bg-primary-100 rounded-xl overflow-hidden mb-3"
                style={{
                    width: "49%",
                }}
                onPress={() => router.push(`/(tabs)/shop/${item.id}`)} // หรือ router.push(`/shop/${item.id}`)
                >
                <Image
                    source={{ uri: item.img }}
                    className="h-40 w-full"
                    resizeMode="cover"
                />
                <View
                    className="p-3 flex-col justify-between"
                    style={{ minHeight: 84 }}
                >
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


        {/* P2P Tab */}
        {activeTab === "p2p" && (
          <View>
            {/* Services */}
            <View className="bg-primary-100 flex-row justify-between mb-4 p-3 rounded-full">
              {p2pServices.map((s) => (
                <View key={s.id} className="flex-1 items-center">
                  <Text className="text-alabaster">{s.title}</Text>
                  <Text className="text-accent-200">{s.price}</Text>
                </View>
              ))}
            </View>

            {/* Schedule */}
            {schedule.map((d) => (
              <View key={d.id} className="bg-primary-100 rounded-2xl p-3 mb-3">
                <Text className="text-alabaster mb-2">{d.date}</Text>
                <View className="flex-row flex-wrap gap-2">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }} 
                  >
                    {d.times.map((t, i) => (
                      <TouchableOpacity
                        key={i}
                        className="bg-accent-200 px-3 py-1 rounded-full"
                        onPress={() => router.push(`/(tabs)/p2p/${profile.id}`)}
                      >
                        <Text className="text-black text-sm">{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
