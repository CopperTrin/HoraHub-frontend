import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";

type Category = {
  CategoryID: string;
  Category_name: string;
  Category_Description: string;
  Category_type: string;
  Services?: any[];
};

const CATEGORY_TYPES = [
  { value: "TAROT_READING", label: "ไพ่ทาโรต์" },
  { value: "PALM_READING", label: "ดูลายมือ" },
  { value: "ASTROLOGY", label: "โหราศาสตร์" },
  { value: "NUMEROLOGY", label: "เลขศาสตร์" },
  { value: "CRYSTAL_READING", label: "อ่านพลังคริสตัล" },
  { value: "SPIRITUAL_GUIDANCE", label: "แนะแนวทางจิตวิญญาณ" },
  { value: "FORTUNE_TELLING", label: "ทำนายดวงทั่วไป" },
  { value: "PSYCHIC_READING", label: "พลังจิต/สัมผัสพิเศษ" },
  { value: "OTHER", label: "อื่น ๆ" },
];

const getBaseURL = () => "https://softdev-horahub-backend-production.up.railway.app";

export default function AdminCategoryPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // form state
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState(CATEGORY_TYPES[0].value);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDesc("");
    setType(CATEGORY_TYPES[0].value);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.Category_name);
    setDesc(cat.Category_Description);
    setType(cat.Category_type);
    setModalOpen(true);
  };

  const authHeaders = useMemo(
    () => ({
      async get() {
        const token = await SecureStore.getItemAsync("access_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    []
  );

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<Category[]>(`${getBaseURL()}/service-categories`);
      setCategories(res.data || []);
    } catch (e: any) {
      console.log("Fetch categories error:", e?.response?.data || e?.message || e);
      Alert.alert("โหลดหมวดหมู่ล้มเหลว", e?.response?.data?.message ?? "ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const onSubmit = async () => {
    if (!name.trim() || !type.trim()) {
      Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกชื่อหมวดหมู่และประเภทให้ครบถ้วน");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        Category_name: name.trim(),
        Category_Description: desc.trim(),
        Category_type: type.trim(),
      };
      const headers = await authHeaders.get();

      if (editing) {
        const res = await axios.patch<Category>(
          `${getBaseURL()}/service-categories/${editing.CategoryID}`,
          body,
          { headers: { ...headers, "Content-Type": "application/json" } }
        );
        setCategories((prev) =>
          prev.map((c) => (c.CategoryID === res.data.CategoryID ? res.data : c))
        );
        Alert.alert("สำเร็จ", "แก้ไขหมวดหมู่เรียบร้อยแล้ว");
      } else {
        const res = await axios.post<Category>(
          `${getBaseURL()}/service-categories`,
          body,
          { headers: { ...headers, "Content-Type": "application/json" } }
        );
        setCategories((prev) => [res.data, ...prev]);
        Alert.alert("สำเร็จ", "สร้างหมวดหมู่เรียบร้อยแล้ว");
      }
      setModalOpen(false);
      resetForm();
    } catch (e: any) {
      console.log("Submit error:", e?.response?.data || e?.message || e);
      const msg =
        e?.response?.data?.message ??
        (editing ? "ไม่สามารถแก้ไขหมวดหมู่ได้" : "ไม่สามารถสร้างหมวดหมู่ได้");
      Alert.alert("ข้อผิดพลาด", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = (cat: Category) => {
    Alert.alert(
      "ลบหมวดหมู่",
      `คุณต้องการลบ "${cat.Category_name}" ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            try {
              const headers = await authHeaders.get();
              await axios.delete(`${getBaseURL()}/service-categories/${cat.CategoryID}`, {
                headers,
              });
              setCategories((prev) => prev.filter((c) => c.CategoryID !== cat.CategoryID));
              Alert.alert("สำเร็จ", "ลบหมวดหมู่เรียบร้อยแล้ว");
            } catch (e: any) {
              console.log("Delete error:", e?.response?.data || e?.message || e);
              Alert.alert(
                "ลบไม่สำเร็จ",
                e?.response?.data?.message ?? "ไม่สามารถลบหมวดหมู่ได้"
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getThaiLabel = (value: string) =>
    CATEGORY_TYPES.find((t) => t.value === value)?.label ?? value;

  const renderItem = ({ item }: { item: Category }) => (
    <View className="bg-primary-100 rounded-2xl p-4 mb-3">
      <Text className="text-white font-sans-semibold text-lg" numberOfLines={1}>
        {item.Category_name}
      </Text>
      <Text className="text-[#D9D9D9] font-sans-regular mt-1" numberOfLines={2}>
        {item.Category_Description || "-"}
      </Text>
      <View className="flex-row items-center justify-between mt-3">
        <View className="px-3 py-1 rounded-full bg-primary-200">
          <Text className="text-white font-sans-medium text-xs">
            {getThaiLabel(item.Category_type)}
          </Text>
        </View>
        <View className="flex-row">
          <Pressable
            onPress={() => openEdit(item)}
            className="mr-3 px-3 py-2 rounded-lg bg-[#ffffff22]"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="edit" size={18} color="white" />
              <Text className="text-white ml-1 font-sans-medium">แก้ไข</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => onDelete(item)}
            className="px-3 py-2 rounded-lg bg-accent-200"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="delete" size={18} />
              <Text className="text-blackpearl ml-1 font-sans-medium">ลบ</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <HeaderBar title="หมวดหมู่บริการดูดวง" />
      <View className="flex-1 px-4 pt-3 pb-24">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-xl font-sans-semibold">รายการหมวดหมู่</Text>
          <Pressable
            onPress={openCreate}
            className="flex-row items-center px-3 py-2 rounded-xl bg-[#ffffff22]"
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white ml-1 font-sans-medium">เพิ่มหมวดหมู่</Text>
          </Pressable>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
            <Text className="text-white mt-2 font-sans-medium">กำลังโหลด…</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.CategoryID}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
            ListEmptyComponent={
              <Text className="text-[#D9D9D9] text-base font-sans-regular mt-6 self-center">
                ยังไม่มีหมวดหมู่
              </Text>
            }
          />
        )}
      </View>

      {/* Modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!submitting) setModalOpen(false);
        }}
      >
        <Pressable
          onPress={() => (!submitting ? setModalOpen(false) : null)}
          className="flex-1 bg-[rgba(0,0,0,0.35)] items-center justify-center"
        >
          <Pressable onPress={() => {}} className="bg-primary-200 w-[90%] rounded-2xl p-4">
            <View className="items-center mb-2">
              <Text className="text-white font-sans-semibold text-xl">
                {editing ? "แก้ไขหมวดหมู่" : "สร้างหมวดหมู่"}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-white font-sans-medium mb-1">ชื่อหมวดหมู่ *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="เช่น Tarot Reading Services"
                placeholderTextColor="#A0A0A0"
                className="bg-primary-100 rounded-xl px-3 py-2 text-white font-sans-regular"
              />
            </View>

            <View className="mb-3">
              <Text className="text-white font-sans-medium mb-1">รายละเอียด</Text>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="คำอธิบายหมวดหมู่"
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={3}
                className="bg-primary-100 rounded-xl px-3 py-2 text-white font-sans-regular"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white font-sans-medium mb-1">ประเภท *</Text>
              <View className="bg-primary-100 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={type}
                  dropdownIconColor="#fff"
                  onValueChange={(val) => setType(val)}
                  style={{ color: "white" }}
                >
                  {CATEGORY_TYPES.map((t) => (
                    <Picker.Item key={t.value} label={t.label} value={t.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="flex-row justify-end">
              <Pressable
                disabled={submitting}
                onPress={() => setModalOpen(false)}
                className="px-4 py-2 mr-2 rounded-xl bg-[#ffffff22]"
              >
                <Text className="text-white font-sans-medium">ยกเลิก</Text>
              </Pressable>
              <Pressable
                disabled={submitting}
                onPress={onSubmit}
                className="px-4 py-2 rounded-xl bg-accent-200"
              >
                <Text className="text-blackpearl font-sans-semibold">
                  {submitting ? "กำลังบันทึก…" : editing ? "บันทึกการแก้ไข" : "สร้าง"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}
