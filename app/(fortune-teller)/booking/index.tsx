
import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text} from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";

export default function BookingDashboardPage() {
  return (
    <ScreenWrapper>
      <HeaderBar
        title="P2P Booking"
        showChat
      />
      <View className="flex-1 bg-primary-200 items-center justify-center">
        <Text className="text-accent-200 text-lg font-bold">P2p</Text>
      </View>
    </ScreenWrapper>
  );
}
