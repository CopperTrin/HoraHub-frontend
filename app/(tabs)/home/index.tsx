
import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text} from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";

import { useRouter } from "expo-router";

export default function HomePage() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <HeaderBar
        title="HoraHub"
        showSearch
        showChat
        onSearchSubmit={(query) => {
          console.log("ค้นหา:", query);
        }}
      />
      <View className="flex-1 bg-primary-200 items-center justify-center">
        <Text className="text-accent-200 text-lg font-bold">Hello Tailwind</Text>
      </View>
    </ScreenWrapper>
  );
}
