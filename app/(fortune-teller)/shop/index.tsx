import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons"

import product_4 from "@/assets/images/product/4.png";
import product_5 from "@/assets/images/product/5.png";
import product_6 from "@/assets/images/product/6.png";

const products = [
  { id: "4", name: "เครื่องรางของต่างประเทศ รวมชุด", price: 1800, image: product_4 },
  { id: "5", name: "น้ำเต้า", price: 299, image: product_5 },
  { id: "6", name: "ปี่เซียะมงคล", price: 1000, image: product_6 },
];

export default function ShopDashboardPage() {
  const router = useRouter();

    return (
    <ScreenWrapper>
      <HeaderBar
        title="Shop"
        showChat
      />
      <ScrollView 
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom : 20,
          paddingTop:8
        }}
      >
      <View className="flex-1">

        {/* เมนูปุ่มกด */}
        <TouchableOpacity
          className="bg-primary-100 flex-row items-center justify-between rounded-full px-5 py-4 mb-4"
          onPress={() => router.push("/(fortune-teller)/shop/create_product")}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="add-box" size={20} color="white" />
            <Text className="text-alabaster text-base font-semibold ml-3">สร้างสินค้าใหม่</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="white" />
        </TouchableOpacity>

        {/* แสดงรายการสินค้า */}
        <View className="space-y-3">
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              className="bg-primary-100 rounded-2xl flex-row p-2 mb-2"
              onPress={() => router.push(`/(fortune-teller)/shop/${product.id}`)}
            >
              {/* รูปสินค้า */}
              <Image
                source={product.image}
                className="w-24 h-24 rounded-xl"
                resizeMode="cover"
              />
              
              {/* ข้อมูลสินค้า */}
              <View className="flex-1 ml-4 justify-center">
                <Text
                  className="text-alabaster font-medium"
                  numberOfLines={2}
                >
                  {product.name}
                </Text>
                <Text className="text-yellow-400 text-base font-bold mt-2">
                  ฿{product.price.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

       
      </View>
      </ScrollView>
    </ScreenWrapper>
  )
}
