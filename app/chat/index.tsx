
import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text} from "react-native";
import HeaderBar from "../components/ui/HeaderBar";
import { useRouter } from "expo-router";

export default function ChatPage() {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <HeaderBar
        title="Chat"
        showBack={true}
        rightIcons={[
          { name: "search", onPress: () => console.log("Search tapped") },
          { name: "chat-bubble-outline", onPress: () => router.push("/chat") },
        ]}
      />
      <View className="flex-1 bg-primary-200 items-center justify-center">
        <Text className="text-accent-200 text-lg font-bold">Chat</Text>
      </View>
    </ScreenWrapper>
  );
}
