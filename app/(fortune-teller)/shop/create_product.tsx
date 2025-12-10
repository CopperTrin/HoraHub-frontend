import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import Feather from '@expo/vector-icons/Feather';
import HeaderBar from "../../components/ui/HeaderBar";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function CreateProductPage() {
  const [images, setImages] = useState<string[]>([]);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    link: "",
    detail: "",
  });

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
      <HeaderBar title="สร้างสินค้าใหม่" showChat showBack />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
          paddingTop: 8,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((uri, idx) => (
            <View key={idx} className="relative mr-2">
              <Image
                source={{ uri }}
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
            <MaterialCommunityIcons name="file-image-plus" size={32} color="#F8F8F8" />
          </TouchableOpacity>
        </ScrollView>

        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Feather name="package" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">ชื่อสินค้า</Text>
        </View>
        <TextInput
          value={product.name}
          onChangeText={(text) => setProduct({ ...product, name: text })}
          placeholder="กรอกชื่อสินค้า"
          placeholderTextColor="#aaa"
          className="bg-primary-100 text-alabaster rounded-full px-4 py-3"
        />

        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Ionicons name="pricetags" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">ราคา</Text>
        </View>
        <TextInput
          value={product.price}
          onChangeText={(text) => setProduct({ ...product, price: text })}
          placeholder="กรอกราคาสินค้า"
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
          placeholder="ราคาลิงก์สินค้า"
          placeholderTextColor="#aaa"
          className="bg-primary-100 text-alabaster rounded-full px-4 py-3"
        />

        {/* Detail */}
        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Ionicons name="document-text" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">รายละเอียด</Text>
        </View>
        <TextInput
          value={product.detail}
          onChangeText={(text) => setProduct({ ...product, detail: text })}
          placeholder="กรอกรายละเอียด"
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={5}
          className="bg-primary-100 text-alabaster rounded-2xl px-4 py-3 h-60"
        />

        <TouchableOpacity className="mt-6 bg-accent-200 py-3 rounded-full items-center">
          <Text className="font-bold text-lg">สร้างสินค้า</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
