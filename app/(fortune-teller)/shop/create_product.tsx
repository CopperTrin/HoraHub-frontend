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

  // เลือกรูป
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

  // ลบรูป
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  return (
    <ScreenWrapper>
      <HeaderBar title="Create Product" showChat showBack />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
          paddingTop: 8,
        }}
      >
        {/* Preview selected images */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((uri, idx) => (
            <View key={idx} className="relative mr-2">
              <Image
                source={{ uri }}
                className="w-24 h-24 rounded-2xl"
              />
              {/* ปุ่มลบรูป */}
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

        {/* Name */}
        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Feather name="package" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">Name</Text>
        </View>
        <TextInput
          value={product.name}
          onChangeText={(text) => setProduct({ ...product, name: text })}
          placeholder="Enter product name"
          placeholderTextColor="#aaa"
          className="bg-primary-100 text-alabaster rounded-full px-4 py-3"
        />

        {/* Price */}
        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Ionicons name="pricetags" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">Price</Text>
        </View>
        <TextInput
          value={product.price}
          onChangeText={(text) => setProduct({ ...product, price: text })}
          placeholder="Enter price"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          className="bg-primary-100 text-alabaster rounded-full px-4 py-3"
        />

        {/* Link */}
        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Ionicons name="link" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">Link</Text>
        </View>
        <TextInput
          value={product.link}
          onChangeText={(text) => setProduct({ ...product, link: text })}
          placeholder="Enter link"
          placeholderTextColor="#aaa"
          className="bg-primary-100 text-alabaster rounded-full px-4 py-3"
        />

        {/* Detail */}
        <View className="flex-row items-center mt-4 mb-1 gap-2">
          <Ionicons name="document-text" size={16} color="#F8F8F8" />
          <Text className="text-alabaster text-base">Detail</Text>
        </View>
        <TextInput
          value={product.detail}
          onChangeText={(text) => setProduct({ ...product, detail: text })}
          placeholder="Enter product details"
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={5}
          className="bg-primary-100 text-alabaster rounded-2xl px-4 py-3 h-60"
        />

        {/* Submit Button */}
        <TouchableOpacity className="mt-6 bg-accent-200 py-3 rounded-full items-center">
          <Text className="font-bold text-lg">Create Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
