
import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text} from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";

export default function ShopPage() {
  return (
    <ScreenWrapper>
      <HeaderBar
        title="Shop"
        showSearch
        showChat
        onSearchSubmit={(query) => {
          console.log("ค้นหา:", query);
        }}
      />
      <View className="flex-1 bg-primary-200 items-center justify-center">
        <Text className="text-accent-200 text-lg font-bold">Hello SHop</Text>
      </View>
    </ScreenWrapper>
  );
}
