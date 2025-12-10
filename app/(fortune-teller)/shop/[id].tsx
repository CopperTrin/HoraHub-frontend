import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import HeaderBar from "../../components/ui/HeaderBar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams } from "expo-router";

import product_4 from "@/assets/images/product/4.png";
import product_5 from "@/assets/images/product/5.png";
import product_6 from "@/assets/images/product/6.png";

const mockProducts = [
  {
    id: "4",
    name: "เครื่องรางของต่างประเทศ รวมชุด",
    price: 1800,
    image: [product_4],
    link: "https://shopee.co.th",
    detail:
      "เครื่องรางของต่างประเทศชุดนี้เป็นการรวมพลังแห่งความเชื่อจากหลากหลายวัฒนธรรม เช่น เหรียญ Saint Benedict จากอิตาลี ตุ๊กตามาเนกิเนโกะจากญี่ปุ่น และเกือกม้าจากยุโรปตอนเหนือ ทั้งหมดนี้ถูกคัดสรรและผ่านพิธีเสริมพลังให้เหมาะกับผู้ที่ต้องการพลังคุ้มครองรอบด้าน ทั้งการเงิน ความรัก และสุขภาพ เป็นชุดเครื่องรางที่เหมาะกับผู้ชื่นชอบของมงคลจากทั่วโลก สามารถวางบนโต๊ะทำงาน หิ้งบูชา หรือพกติดตัวก็ได้",
  },
  {
    id: "5",
    name: "น้ำเต้า",
    price: 299,
    image: [product_5],
    link: "https://shopee.co.th",
    detail:
      "น้ำเต้าเป็นสัญลักษณ์แห่งความอุดมสมบูรณ์และความโชคดีในวัฒนธรรมจีนและไทย เชื่อกันว่าเป็นภาชนะเก็บทรัพย์ เก็บโชค และป้องกันสิ่งไม่ดีต่างๆ โดยเฉพาะในทางฮวงจุ้ย น้ำเต้ามักถูกนำไปแขวนไว้ที่หัวเตียงหรือหน้าบ้านเพื่อดูดซับพลังงานลบ และเสริมพลังงานชีวิตในบ้านให้สมดุล เหมาะสำหรับผู้ที่ต้องการเสริมสุขภาพ โชคลาภ และความมั่นคงในชีวิต ครูบาอาจารย์บางสายยังปลุกเสกให้มีพลังคุ้มครองเจ้าของจากภัยพิบัติและโรคภัยได้อีกด้วย",
  },
  {
    id: "6",
    name: "ปี่เซียะมงคล",
    price: 1000,
    image: [product_6],
    link: "https://shopee.co.th",
    detail:
      "ปี่เซียะมงคลเป็นสัตว์ศักดิ์สิทธิ์ในตำนานจีนที่ไม่มีทวารขับถ่าย หมายถึงเงินทองที่เข้ามาแล้วไม่ไหลออก เหมาะอย่างยิ่งสำหรับผู้ที่ต้องการเสริมดวงด้านการเงิน การค้าขาย และโชคลาภ ปี่เซียะยังเป็นผู้พิทักษ์ป้องกันสิ่งชั่วร้ายและพลังลบต่างๆ ไม่ให้เข้ามากระทบเจ้าของ สามารถวางไว้บนโต๊ะทำงาน เคาน์เตอร์ร้านค้า หรือหิ้งพระ โดยหันหน้าไปทางประตูร้านหรือทิศเหนือ จะช่วยเปิดทางทรัพย์และความสำเร็จ",
  },
];

export default function EditProductDetailPage() {
  const { id } = useLocalSearchParams(); 

  const initialProduct =
    mockProducts.find((p) => p.id === id) || mockProducts[0];

  const [product, setProduct] = useState(initialProduct);
  const [images, setImages] = useState<any[]>(initialProduct.image || []);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newUris]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  return (
    <ScreenWrapper>
      <HeaderBar title="แก้ไขสินค้า" showChat showBack />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
          paddingTop: 8,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((img, idx) => (
            <View key={idx} className="relative mr-2">
              <Image
                source={typeof img === "number" ? img : { uri: img }}
                className="w-24 h-24 rounded-2xl"
              />
              <TouchableOpacity
                onPress={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
              >
                <Ionicons name="close" size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={pickImages}
            className="w-24 h-24 bg-primary-100 rounded-2xl items-center justify-center"
          >
            <MaterialCommunityIcons
              name="file-image-plus"
              size={32}
              color="#F8F8F8"
            />
          </TouchableOpacity>
        </ScrollView>

        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Feather name="package" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">ชื่อสินค้า</Text>
        </View>
        <TextInput
          value={product.name}
          onChangeText={(text) => setProduct({ ...product, name: text })}
          placeholder="Enter product name"
          placeholderTextColor="#aaa"
          className="bg-primary-100 text-alabaster rounded-full px-4 py-3"
        />

        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Ionicons name="pricetags" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">ราคา</Text>
        </View>
        <TextInput
          value={String(product.price)}
          onChangeText={(text) =>
            setProduct({ ...product, price: Number(text) })
          }
          placeholder="Enter price"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          className="bg-primary-100 text-alabaster rounded-full px-4 py-3"
        />

        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Ionicons name="link" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">ลิงก์สินค้า</Text>
        </View>
        <TextInput
          value={product.link}
          onChangeText={(text) => setProduct({ ...product, link: text })}
          placeholder="Enter link"
          placeholderTextColor="#aaa"
          className="bg-primary-100 text-alabaster rounded-full px-4 py-3"
        />

        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Ionicons name="document-text" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">รายละเอียด</Text>
        </View>
        <TextInput
          value={product.detail}
          onChangeText={(text) => setProduct({ ...product, detail: text })}
          placeholder="Enter product details"
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={6}
          className="bg-primary-100 text-alabaster rounded-2xl px-4 py-3 h-60"
        />
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 84,
          zIndex: 50,
          backgroundColor: "transparent",
        }}
      >
        <View className="py-3 flex-row gap-2">
          <TouchableOpacity className="flex-1 bg-red-500 py-3 rounded-2xl items-center">
            <Text className="font-semibold text-lg text-white">ลบสินค้า</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-accent-200 py-3 rounded-2xl items-center">
            <Text className="font-semibold text-lg text-black">
              บันทึกการเเก้ไข
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
