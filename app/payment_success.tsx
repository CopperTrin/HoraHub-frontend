import ScreenWrapper from "@/app/components/ScreenWrapper";
import { FontAwesome } from "@expo/vector-icons";
import { navigate } from "expo-router/build/global-state/routing";
import { Text, TouchableOpacity, View } from "react-native";
import HeaderBar from "./components/ui/HeaderBar";
import "./global.css";

export default function App() {
  return (
    <ScreenWrapper>
      <HeaderBar 
        title="Success"
        showBack
      />
      <View className="flex-1 bg-primary-200 items-center p-5 justify-center">
          <FontAwesome name="check-circle" color="#7431FA" size={100} />
          <Text className="text-xl font-bold text-secondary-200 mt-3">
              Payment Successful
          </Text>
          <TouchableOpacity
              className="bg-primary-100 w-48 py-2 rounded-lg items-center mt-5"
              onPress={() => navigate("./(tabs)/home")}
          >
              <Text className="font-bold text-alabaster text-base">กลับสู่หน้าหลัก</Text>
          </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
