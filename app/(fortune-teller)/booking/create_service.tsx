// app/(fortune-teller)/booking/service.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";

// ===== Payload ตาม Swagger =====
type ServicePayload = {
  Service_name: string;
  Service_Description: string;
  Price: number;
  ImageURLs: string[];
  CategoryID: string;
};

// ===== Server types (ย่อ) =====
type CategoryServer = {
  CategoryID: string;
  Category_name: string;
  Category_Description?: string | null;
  Category_type?: string | null;
};

// ===== UI type =====
type ServiceCategory = { id: string; name: string };

// ===== Axios (หน้าเดียว) =====
const ACCESS_TOKEN_KEY = "access_token"; // ให้ตรงกับหน้า SignIn ของคุณ
const computeBaseURL = () => {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env;
  // @ts-ignore
  const { Platform } = require("react-native");
  return Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";
};

const api = axios.create({
  baseURL: computeBaseURL(),
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function CreateServicePage() {
  const router = useRouter();

  // ===== states (ไม่มีค่าเริ่มต้น) =====
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [loadingCats, setLoadingCats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ===== helpers =====
  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setImageInput("");
  };
  const removeImage = (url: string) =>
    setImages((prev) => prev.filter((u) => u !== url));

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<CategoryServer[]>("/service-categories");
      const list: ServiceCategory[] = (res.data || []).map((c) => ({
        id: c.CategoryID,
        name: c.Category_name,
      }));
      setCategories(list);
      // ไม่ตั้งค่าเริ่มต้นอัตโนมัติ — ให้ผู้ใช้เลือกเอง
      if (list.length === 0) setCategoryId("");
    } catch (e: any) {
      console.log("Fetch categories error:", e?.message || e);
      Alert.alert("ดึงหมวดหมู่ไม่สำเร็จ", "ลองรีเฟรชอีกครั้ง");
    } finally {
      setLoadingCats(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
    } finally {
      setRefreshing(false);
    }
  }, [fetchCategories]);

  const validateAndBuildPayload = (): ServicePayload | null => {
    if (!name.trim()) {
      Alert.alert("กรอกไม่ครบ", "กรุณาใส่ชื่อบริการ");
      return null;
    }
    if (!desc.trim()) {
      Alert.alert("กรอกไม่ครบ", "กรุณาใส่คำอธิบาย");
      return null;
    }
    if (!categoryId) {
      Alert.alert("กรอกไม่ครบ", "กรุณาเลือกหมวดหมู่");
      return null;
    }

    const priceNum = parseFloat((price || "").replace(",", "."));
    if (!isFinite(priceNum) || priceNum < 0) {
      Alert.alert("ราคาไม่ถูกต้อง", "กรุณาใส่ราคาเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0");
      return null;
    }

    const cleanedImages = images.map((u) => u.trim()).filter(Boolean);

    const payload: ServicePayload = {
      Service_name: name.trim(),
      Service_Description: desc.trim(),
      Price: priceNum,
      ImageURLs: cleanedImages,
      CategoryID: categoryId,
    };
    return payload;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const payload = validateAndBuildPayload();
    if (!payload) return;

    try {
      setSubmitting(true);
      await api.post("/services", payload);
      Alert.alert("สำเร็จ", "สร้างบริการเรียบร้อย", [
        { text: "ตกลง", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.log("Create service error:", e?.response?.data || e?.message || e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "บันทึกไม่สำเร็จ กรุณาลองใหม่";
      Alert.alert("เกิดข้อผิดพลาด", String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Render =====
  return (
    <ScreenWrapper>
      <HeaderBar title="Create Service" showBack />

      {loadingCats ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="text-white/70 mt-3">กำลังโหลดหมวดหมู่...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 28,
            paddingTop: 8,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Name */}
          <Text className="text-white/70 mb-2">Service name</Text>
          <View className="bg-primary-100 rounded-2xl px-3 py-2 mb-4 border border-white/10">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Tarot Reading"
              placeholderTextColor="#9CA3AF"
              className="text-alabaster text-base py-2"
              editable={!submitting}
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
              editable={!submitting}
            />
          </View>

          {/* Price */}
          <Text className="text-white/70 mb-2">Price (USD)</Text>
          <View className="bg-primary-100 rounded-2xl px-3 py-2 mb-4 border border-white/10">
            <TextInput
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
              placeholder="e.g. 49.99"
              placeholderTextColor="#9CA3AF"
              className="text-alabaster text-base py-2"
              editable={!submitting}
            />
          </View>

          {/* Category (ให้ผู้ใช้เป็นคนเลือกเอง) */}
          <Text className="text-white/70 mb-2">Category</Text>
          {categories.length > 0 ? (
            <View className="bg-primary-100 rounded-2xl p-3 mb-4 border border-white/10">
              <View className="flex-row flex-wrap gap-2">
                {categories.map((c) => {
                  const active = categoryId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setCategoryId(c.id)}
                      disabled={submitting}
                      className={`px-3 py-2 rounded-xl border ${
                        active
                          ? "bg-yellow-400/20 border-yellow-400"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <Text
                        className={`${
                          active ? "text-yellow-300" : "text-white/80"
                        } font-medium`}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <View className="bg-primary-100 rounded-2xl p-4 mb-4 border border-white/10">
              <Text className="text-white/70">
                ยังไม่มีหมวดหมู่ — โปรดลองรีเฟรชอีกครั้ง
              </Text>
            </View>
          )}

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
                editable={!submitting}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={addImage}
                disabled={submitting || !imageInput.trim()}
                className={`rounded-xl px-3 justify-center ml-2 ${
                  imageInput.trim() ? "bg-yellow-400" : "bg-yellow-400/60"
                }`}
              >
                <Text className="text-black font-bold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {images.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-6">
              {images.map((u) => (
                <View
                  key={u}
                  className="flex-row items-center bg-white/10 border border-white/10 rounded-full px-3 py-1"
                >
                  <Text
                    className="text-white/85 mr-2"
                    numberOfLines={1}
                    style={{ maxWidth: 210 }}
                  >
                    {u}
                  </Text>
                  <TouchableOpacity onPress={() => removeImage(u)} disabled={submitting}>
                    <Text className="text-red-400 font-bold">✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || !categoryId}
            className={`rounded-full items-center justify-center py-4 mb-10 ${
              submitting || !categoryId ? "bg-yellow-400/60" : "bg-yellow-400"
            }`}
          >
            <Text className="text-black font-extrabold text-base">
              {submitting ? "กำลังบันทึก..." : "Create Service"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}
