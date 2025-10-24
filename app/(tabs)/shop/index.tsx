import React, { useState } from "react";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import product_1 from "@/assets/images/product/1.png";
import product_2 from "@/assets/images/product/2.png";
import product_3 from "@/assets/images/product/3.png";
import product_4 from "@/assets/images/product/4.png";
import product_5 from "@/assets/images/product/5.png";
import product_6 from "@/assets/images/product/6.png";
import product_7 from "@/assets/images/product/7.png";
import product_8 from "@/assets/images/product/8.png";
import product_9 from "@/assets/images/product/9.png";

const products = [
  { id: "1", name: "เครื่องรางเสริมดวงการเงินแบบไทยๆ", price: 699, image: product_1 },
  { id: "2", name: "พระปิดตา", price: 5900, image: product_2 },
  { id: "3", name: "ไซดักทรัพย์", price: 100, image: product_3 },
  { id: "4", name: "เครื่องรางของต่างประเทศ รวมชุด", price: 1800, image: product_4 },
  { id: "5", name: "น้ำเต้า", price: 299, image: product_5 },
  { id: "6", name: "ปี่เซียะมงคล", price: 1000, image: product_6 },
  { id: "7", name: "ด้ายแดง", price: 10, image: product_7 },
  { id: "8", name: "คางคกคาบเหรียญ", price: 890, image: product_8 },
  { id: "9", name: "หินยูนาไคต์", price: 99, image: product_9 },
];

export default function ShopPage() {
  const router = useRouter();
  const [searchTag, setSearchTag] = useState<string | null>(null);

  const filteredProducts = searchTag
    ? products.filter((item) =>
        item.name.toLowerCase().includes(searchTag.toLowerCase())
      )
    : products;

  const handleSearch = (query: string) => {
    if (query.trim() !== "") {
      setSearchTag(query.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchTag(null);
  };

  return (
    <ScreenWrapper>
      <HeaderBar
        title="Shop"
        showChat
        showSearch
        onSearchSubmit={handleSearch}
      />

      
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingBottom: 20,
        }}
      >
  
        {searchTag && (
          <View className="flex-row items-center bg-accent-200 px-2 py-1 mt-3 rounded-full self-start">
            <Text className="text-blackpearl ml-2 mr-1">{searchTag}</Text>
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color="black" />
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row flex-wrap justify-between mt-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-primary-100 rounded-xl overflow-hidden mb-3"
                style={{ width: "49%" }}
                onPress={() => router.push(`/(tabs)/shop/${item.id}`)}
              >
                <Image
                  source={item.image}
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
            ))
          ) : (
            <Text className="text-center text-gray-400 mt-10">
              ไม่พบสินค้าที่ค้นหา
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
