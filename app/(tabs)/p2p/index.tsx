
import ScreenWrapper from "@/app/components/ScreenWrapper";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";

export default function P2pPage() {
  return (
    <ScreenWrapper>
      <HeaderBar
        title="P2P"
        rightIcons={[
          { name: "calendar-month", onPress: () => console.log("Booking tapped") },
        ]}
        showSearch
        showChat
        onSearchSubmit={(query) => {
          console.log("ค้นหา:", query);
        }}
      />
      <View className="flex-1 bg-primary-200 items-center justify-center">
        <Text className="text-accent-200 text-lg font-bold">P2p</Text>
        <Link href="../../payment_success" className="text-yellow-500 mt-4">Go to Review Screen</Link>
      </View>
    </ScreenWrapper>
  );
}
