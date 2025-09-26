import ScreenWrapper from "@/app/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <HeaderBar title="Profile" showChat />
      <View className="flex-1 bg-primary-200 items-center justify-center">
        <Text className="text-accent-200 text-lg font-bold mb-6">
          Hello Profile
        </Text>

        {/* ปุ่มไปหน้า fortune-teller */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          className="bg-accent-200 px-6 py-3 rounded-full"
        >
          <Text className="text-black text-lg font-bold">
            ไปหน้า customer
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
