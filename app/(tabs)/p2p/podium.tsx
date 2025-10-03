import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeadersBar from "@/app/components/ui/HeaderBar";
import { FlatList, Image, Text, View } from "react-native";

const data = [
  { id: "1", name: "หมอบี", score: 1000, avatar: "https://i.pravatar.cc/150?img=1", rank: 1 },
  { id: "2", name: "Doctor Strange", score: 999, avatar: "https://i.pravatar.cc/150?img=2", rank: 2 },
  { id: "3", name: "อาจารย์แตง", score: 998, avatar: "https://i.pravatar.cc/150?img=3", rank: 3 },
  { id: "4", name: "หมอ ออย", score: 997, avatar: "https://i.pravatar.cc/150?img=4", rank: 4 },
  { id: "5", name: "หมอศิษะนอย", score: 996, avatar: "https://i.pravatar.cc/150?img=5", rank: 5 },
  { id: "6", name: "หวัง4เจ้า", score: 976, avatar: "https://i.pravatar.cc/150?img=6", rank: 6 },
  { id: "7", name: "ลูกหมอศิษะนอย", score: 953, avatar: "https://i.pravatar.cc/150?img=7", rank: 7 },
  { id: "8", name: "หมอหมูเนื้อ", score: 845, avatar: "https://i.pravatar.cc/150?img=8", rank: 8 },
];

const RankingScreen = () => {
  const top3 = data.slice(0, 3);
  const others = data.slice(3);

  return (
    <ScreenWrapper>
      <HeadersBar title="Podium" showBack />
      {/* Top 3 podium */}
      <View className="flex-row justify-center items-end p-4">
        {/* 2nd */}
        <View className="items-center mx-3">
          <Image source={{ uri: top3[1].avatar }} className="w-16 h-16 rounded-full mb-2" />
          <Text className="text-alabaster font-bold">{top3[1].name}</Text>
          <View className="items-center bg-accent-200 px-3 py-1 mt-1 h-24 w-14">
            <Text className="text-secondary-200 font-bold text-xl">2</Text>
          </View>
        </View>

        {/* 1st */}
        <View className="items-center mx-3">
          <Image source={{ uri: top3[0].avatar }} className="w-20 h-20 rounded-full mb-2" />
          <Text className="text-alabaster font-bold">{top3[0].name}</Text>
          <View className="items-center bg-accent-200 px-4 py-2 mt-1 h-32 w-14">
            <Text className="text-secondary-200 font-bold text-xl">1</Text>
          </View>
        </View>

        {/* 3rd */}
        <View className="items-center mx-3">
          <Image source={{ uri: top3[2].avatar }} className="w-16 h-16 rounded-full mb-2" />
          <Text className="text-alabaster font-bold">{top3[2].name}</Text>
          <View className="items-center bg-accent-200 px-3 py-1 mt-1 h-20 w-14">
            <Text className="text-secondary-200 font-bold text-xl">3</Text>
          </View>
        </View>
      </View>

      {/* List ranking */}
      <FlatList
        data={others}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-secondary-100 px-4 py-3 border-b border-blackpearl">
            <Text className="w-6 text-alabaster font-bold">{item.rank}</Text>
            <Image source={{ uri: item.avatar }} className="w-8 h-8 rounded-full mx-2" />
            <Text className="flex-1 text-alabaster">{item.name}</Text>
            <Text className="text-accent-100 font-bold">{item.score}</Text>
          </View>
        )}
      />
    </ScreenWrapper>
  );
};

export default RankingScreen;