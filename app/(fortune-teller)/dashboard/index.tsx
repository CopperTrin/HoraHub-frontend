import ScreenWrapper from "@/app/components/ScreenWrapper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <HeaderBar
        title="Fortune teller"
        showChat
      />
      <ScrollView 
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom : 20
        }}
      >
      <View className="flex-1">

        <Image
          source={{uri: 'https://www.riauone.com/photo/berita/dir072023/4125_Shopee-announces-initiatives-to-support-seller-growth.jpg'}}
          className="w-full h-64 rounded-xl mb-4"
          resizeMode="cover"
        />

        {/* เมนูปุ่มกด */}
        <TouchableOpacity
          className="bg-primary-100 flex-row items-center justify-between rounded-full px-5 py-4 mb-4"
          onPress={() => router.push("/(fortune-teller)/booking")}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="calendar-month" size={20} color="white" />
            <Text className="text-alabaster text-base font-semibold ml-3">P2P My booking</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary-100 flex-row items-center justify-between rounded-full px-5 py-4 mb-4"
          onPress={() => router.push("/(fortune-teller)/shop")}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="shopping-bag" size={20} color="white" />
            <Text className="text-alabaster text-base font-semibold ml-3">My Shop</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="white" />
        </TouchableOpacity>
      </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
