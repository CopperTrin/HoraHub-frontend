import { Link } from "expo-router";
import { Text, View } from "react-native";
import "../global.css";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-red-500">
        Welcome to p2p!
      </Text>
      <Link href={"../review"}>Write your Review</Link>
      <Link href={"../payment_success"}>Payment Success</Link>
    </View>
  );
}