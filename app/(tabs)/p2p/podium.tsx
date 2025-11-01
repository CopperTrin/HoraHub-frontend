import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeadersBar from "@/app/components/ui/HeaderBar";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import fcomponent from "../../fcomponent";

const RankingScreen = () => {
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { id } = route.params as { id: string };
  const API_URL = fcomponent.getBaseURL();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/leaderboards/${id}?page=1&limit=50`);
        setLeaderboardData(res.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <ScreenWrapper>
        <HeadersBar title="Podium" showBack />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-alabaster mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!leaderboardData || !leaderboardData.FortuneTellers?.length) {
    return (
      <ScreenWrapper>
        <HeadersBar title="Podium" showBack />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400">ไม่มีข้อมูลในลีดเดอร์บอร์ด</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const data = leaderboardData.FortuneTellers.map((item: any, index: number) => {
    const f = item.FortuneTeller;
    return {
      id: f.FortuneTellerID,
      name: `${f.User.UserInfo.FirstName} ${f.User.UserInfo.LastName}`,
      score: f.Point,
      avatar: f.User.UserInfo.PictureURL,
      rank: index + 1,
    };
  });

  const top3 = data.slice(0, 3);
  const others = data.slice(3);

  return (
    <ScreenWrapper>
      <HeadersBar title={leaderboardData.Description || "Podium"} showBack />

      <View className="flex-row justify-center items-end p-4">
        {top3[1] && (
          <View className="items-center mx-3">
            <Image
              source={{ uri: top3[1].avatar }}
              className="w-20 h-20 rounded-full mb-2"
            />
            <Text className="text-alabaster">{top3[1].name.slice(0,15)}</Text>
            <View className="justify-center items-center bg-accent-200 mt-1 h-24 w-24 rounded-md">
              <Text className="text-secondary-200 font-bold text-3xl">2</Text>
            </View>
          </View>
        )}

        {top3[0] && (
          <View className="items-center mx-3">
            <Image
              source={{ uri: top3[0].avatar }}
              className="w-20 h-20 rounded-full mb-2"
            />
            <Text className="text-alabaster">{top3[0].name.slice(0,15)}</Text>
            <View className="justify-center items-center bg-accent-200 mt-1 h-32 w-24 rounded-md">
              <Text className="text-secondary-200 font-bold text-3xl">1</Text>
            </View>
          </View>
        )}

        {top3[2] && (
          <View className="items-center mx-3">
            <Image
              source={{ uri: top3[2].avatar }}
              className="w-20 h-20 rounded-full mb-2"
            />
            <Text className="text-alabaster">{top3[2].name.slice(0,15)}</Text>
            <View className="justify-center items-center bg-accent-200 mt-1 h-16 w-16 rounded-md">
              <Text className="text-secondary-200 font-bold text-3xl">3</Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={others}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-secondary-100 px-4 py-3 border-b border-blackpearl">
            <Text className="w-6 text-alabaster font-bold">{item.rank}</Text>
            <Image
              source={{ uri: item.avatar }}
              className="w-12 h-12 rounded-full mx-2"
            />
            <Text className="flex-1 text-alabaster">{item.name}</Text>
            <Text className="text-accent-100 font-bold">{item.score}</Text>
          </View>
        )}
      />
    </ScreenWrapper>
  );
};

export default RankingScreen;