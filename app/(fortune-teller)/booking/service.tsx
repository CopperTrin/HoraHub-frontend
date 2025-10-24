import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";

// Swagger shape
type ServicePayload = {
  Service_name: string;
  Service_Description: string;
  Price: number;
  ImageURLs: string[];
  CategoryID: string;
};

// ตัวอย่าง Category (ปกติ GET /service-categories)
type ServiceCategory = { id: string; name: string };
const categories: ServiceCategory[] = [
  { id: "550e8400-e29b-41d4-a716-446655440000", name: "Tarot" },
  { id: "11111111-1111-1111-1111-111111111111", name: "Thai Astrology" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Love Reading" },
];

export default function CreateServicePage() {
  const router = useRouter();

  // states
  const [name, setName] = useState("Tarot Reading");
  const [desc, setDesc] = useState("A detailed tarot card reading session");
  const [price, setPrice] = useState("49.99");
  const [categoryId, setCategoryId] = useState(categories[0].id);
  const [images, setImages] = useState<string[]>([
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
  ]);
  const [imageInput, setImageInput] = useState("");

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageInput("");
  };
  const removeImage = (url: string) => setImages((prev) => prev.filter((u) => u !== url));

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert("กรอกไม่ครบ", "กรุณาใส่ชื่อบริการ");
    if (!desc.trim()) return Alert.alert("กรอกไม่ครบ", "กรุณาใส่คำอธิบาย");
    if (!categoryId) return Alert.alert("กรอกไม่ครบ", "กรุณาเลือกหมวดหมู่");

    const payload: ServicePayload = {
      Service_name: name.trim(),
      Service_Description: desc.trim(),
      Price: Number(price || 0),
      ImageURLs: images,
      CategoryID: categoryId,
    };

    try {
      // TODO: เรียก API จริงของคุณ
      // await fetch(`${API_URL}/services`, { method: "POST", headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      console.log("POST /services", payload);
      Alert.alert("สำเร็จ", "สร้างบริการเรียบร้อย");
      router.back(); // กลับไปหน้าก่อนหน้า (index)
    } catch (e: any) {
      Alert.alert("เกิดข้อผิดพลาด", e?.message ?? "บันทึกไม่สำเร็จ");
    }
  };

  return (
    <ScreenWrapper>
      <HeaderBar title="Create Service" showBack />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8 }}>
        {/* Name */}
        <Text className="text-white/70 mb-2">Service name</Text>
        <View className="bg-primary-100 rounded-2xl px-3 py-2 mb-4 border border-white/10">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Tarot Reading"
            placeholderTextColor="#9CA3AF"
            className="text-alabaster text-base py-2"
          />
        </View>

        {/* Description */}
        <Text className="text-white/70 mb-2">Description</Text>
        <View className="bg-primary-100 rounded-2xl px-3 py-2 mb-4 border border-white/10">
          <TextInput
            value={desc}
            onChangeText={setDesc}
            multiline
            placeholder="Describe your service..."
            placeholderTextColor="#9CA3AF"
            className="text-alabaster text-base py-2"
          />
        </View>

        {/* Price */}
        <Text className="text-white/70 mb-2">Price (USD)</Text>
        <View className="bg-primary-100 rounded-2xl px-3 py-2 mb-4 border border-white/10">
          <TextInput
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 49.99"
            placeholderTextColor="#9CA3AF"
            className="text-alabaster text-base py-2"
          />
        </View>

        {/* Category */}
        <Text className="text-white/70 mb-2">Category</Text>
        <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10">
          <View className="flex-row flex-wrap gap-2">
            {categories.map((c) => {
              const active = categoryId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  className={`px-3 py-2 rounded-xl border ${
                    active ? "bg-yellow-400/20 border-yellow-400" : "bg-white/5 border-white/10"
                  }`}
                >
                  <Text className={`${active ? "text-yellow-300" : "text-white/80"} font-medium`}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Image URLs */}
        <Text className="text-white/70 mb-2">Image URLs</Text>
        <View className="bg-primary-100 rounded-2xl px-3 py-3 mb-2 border border-white/10">
          <View className="flex-row">
            <TextInput
              value={imageInput}
              onChangeText={setImageInput}
              placeholder="https://..."
              placeholderTextColor="#9CA3AF"
              className="text-alabaster text-base py-2 flex-1"
            />
            <TouchableOpacity onPress={addImage} className="bg-yellow-400 rounded-xl px-3 justify-center ml-2">
              <Text className="text-black font-bold">Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {images.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-6">
            {images.map((u) => (
              <View key={u} className="flex-row items-center bg-white/10 border border-white/10 rounded-full px-3 py-1">
                <Text className="text-white/85 mr-2" numberOfLines={1} style={{ maxWidth: 210 }}>{u}</Text>
                <TouchableOpacity onPress={() => removeImage(u)}>
                  <Text className="text-red-400 font-bold">✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity onPress={handleSubmit} className="bg-yellow-400 rounded-full items-center justify-center py-4 mb-10">
          <Text className="text-black font-extrabold text-base">Create Service</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
