import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeadersBar from "@/app/components/ui/HeaderBar";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity
} from "react-native";
import fcomponent from "../../fcomponent";

const CreateLeaderboard = () => {
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState<number>(0.0);
  const route = useRoute();
  const API_URL = fcomponent.getBaseURL();

  return (
    <ScreenWrapper>
      {/* Header */}
      <HeadersBar title="Systems"/>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-2">

        <TouchableOpacity
          className="bg-accent-200 rounded-2xl py-3 mb-5 mt-3"
          onPress={() => router.navigate("../systems/leaderboard_list")}
        >
          <Text className="text-blackpearl font-semibold text-center">
            กระดานผู้นำ
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default CreateLeaderboard;