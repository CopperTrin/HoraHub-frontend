import ScreenWrapper from "@/app/components/ScreenWrapper";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import {Image,ScrollView,Text,TouchableOpacity,View,Linking,Dimensions,Pressable,} from "react-native";
import { useState } from "react";
import HeaderBar from "../../components/ui/HeaderBar";

const { width: screenWidth } = Dimensions.get("window");

const product = {
  id: "2",
  name: "เครื่องรางศาลเจ้าตะไพุที",
  price: 1000,
  image: [
    "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5LJPy5B4qNdayFGtRrSsdJInLYWvwGnX9BVjkAUMd0O7l7CLSTW.webp",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzGUJhtArs2QjqiSVkQI87EwNBuzKJ_YzzTQ&s"
  ],
  description:
    "ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj...ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj...ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj...ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj...ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj...ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj...ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj...ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj...ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj...",
  fortune_teller: {
    id: "1",
    name: "อาจารย์ไม้รัม",
    profile_img:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfgSRfv0BYIwiTZpoQk3rKrDFnaSHimR1pvQ&s",
  },
  link: "https://shopee.co.th",
};

export default function ProductDetailPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleBuy = () => {
    if (product.link) Linking.openURL(product.link);
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / screenWidth);
    setActiveIndex(newIndex);
  };

  return (
    <ScreenWrapper>
      <HeaderBar title={product.name} showBack showChat />
      <ScrollView contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom : 20
        }}>
        {/* รูปสินค้าแบบ Scroll ได้ */}
        <View className="mb-4">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.image.map((img, index) => (
              <Pressable key={index}>
                <Image
                  source={{ uri: img }}
                  style={{
                    width: screenWidth - 32, 
                    height: 250,
                    borderRadius: 12,
                    // marginRight: index === product.image.length - 1 ? 0 : 8,
                  }}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* Dot Indicator */}
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
            {product.image.map((_, index) => (
              <View
                key={index}
                className={`w-2.5 h-2.5 mx-1 rounded-full ${
                  activeIndex === index ? "bg-accent-200" : "bg-gray-400"
                }`}
              />
            ))}
          </View>
        </View>

        {/* ชื่อ + ราคา */}
        <Text className="text-alabaster text-xl font-bold mb-2">
          {product.name}
        </Text>
        <Text className="text-accent-200 text-2xl font-bold mb-4">
          ฿{product.price}
        </Text>

        {/* ปุ่มสั่งซื้อ ติดล่างหน้าจอ */}
        <View className="mb-4 ">
          <TouchableOpacity
            onPress={handleBuy}
            className="bg-accent-200 rounded-full py-4 items-center"
          >
            <Text className="text-black text-lg font-bold">สั่งซื้อสินค้า</Text>
          </TouchableOpacity>
        </View>

        {/* ส่วนโปรไฟล์หมอดู */}
        <TouchableOpacity
          // onPress={() => router.push(`/fortune-teller/${product.fortune_teller.id}`)}
          className="flex-row items-center bg-primary-100 p-3 rounded-full mb-4"
        >
          <View className="flex-row items-center justify-between gap-4">
            <Image
              source={{ uri: product.fortune_teller.profile_img }}
              className="w-12 h-12 rounded-full"
            />
            <View className="flex-1">
              <Text className="text-alabaster text-lg font-semibold">
                {product.fortune_teller.name}
              </Text>
            </View>
            <Entypo name="chevron-small-right" size={32} color="#F8F8F8" />
          </View>
        </TouchableOpacity>

        {/* รายละเอียดสินค้า */}
        <Text className="text-alabaster text-base leading-6 mb-20">
          {product.description}
        </Text>

        

        
      </ScrollView>
    </ScreenWrapper>
  );
}
