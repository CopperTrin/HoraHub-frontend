
import ScreenWrapper from "@/app/components/ScreenWrapper";
import { Link, useRouter } from "expo-router";
import { Text, View } from "react-native";
import HeaderBar from "../components/ui/HeaderBar";

export default function ChatPage() {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <HeaderBar
        title="Chat"
        showBack
        showSearch
        onSearchSubmit={(query) => {
          console.log("ค้นหา:", query);
        }}
      />
      <View className="flex-1 bg-primary-200 items-center justify-center">
        <Text className="text-accent-200 text-lg font-bold">Chat</Text>
        <Link href="../chat/chat_screen" className="mt-4 px-4 py-2 bg-accent-200 rounded">
          <Text className="text-primary-200 font-semibold">ไปที่หน้าสนทนา</Text>
        </Link>
      </View>
    </ScreenWrapper>
  );
}
