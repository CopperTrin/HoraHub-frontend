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

  // เรียก API ตอนเปิดหน้า
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

  // ถ้ายังโหลดอยู่
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

  // ถ้าไม่มีข้อมูล
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

  // แปลงข้อมูลที่ได้จาก API
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

      {/* Top 3 podium */}
      <View className="flex-row justify-center items-end p-4">
        {/* 2nd */}
        {top3[1] && (
          <View className="items-center mx-3">
            <Image
              source={{ uri: top3[1].avatar }}
              className="w-16 h-16 rounded-full mb-2"
            />
            <Text className="text-alabaster font-bold">{top3[1].name}</Text>
            <View className="items-center bg-accent-200 px-3 py-1 mt-1 h-24 w-14">
              <Text className="text-secondary-200 font-bold text-xl">2</Text>
            </View>
          </View>
        )}

        {/* 1st */}
        {top3[0] && (
          <View className="items-center mx-3">
            <Image
              source={{ uri: top3[0].avatar }}
              className="w-20 h-20 rounded-full mb-2"
            />
            <Text className="text-alabaster font-bold">{top3[0].name}</Text>
            <View className="items-center bg-accent-200 px-4 py-2 mt-1 h-32 w-14">
              <Text className="text-secondary-200 font-bold text-xl">1</Text>
            </View>
          </View>
        )}

        {/* 3rd */}
        {top3[2] && (
          <View className="items-center mx-3">
            <Image
              source={{ uri: top3[2].avatar }}
              className="w-16 h-16 rounded-full mb-2"
            />
            <Text className="text-alabaster font-bold">{top3[2].name}</Text>
            <View className="items-center bg-accent-200 px-3 py-1 mt-1 h-20 w-14">
              <Text className="text-secondary-200 font-bold text-xl">3</Text>
            </View>
          </View>
        )}
      </View>

      {/* List ranking */}
      <FlatList
        data={others}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-secondary-100 px-4 py-3 border-b border-blackpearl">
            <Text className="w-6 text-alabaster font-bold">{item.rank}</Text>
            <Image
              source={{ uri: item.avatar }}
              className="w-8 h-8 rounded-full mx-2"
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