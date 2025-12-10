import ScreenWrapper from "@/app/components/ScreenWrapper";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from "axios";
import { router } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";
import { useEffect, useRef, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";
import fcomponent from "../../fcomponent";

const LeaderboardList = () => {
  const [search, setSearch] = useState("");
  const [report, setReport] = useState<any[]>([]);
  const leaderboardListRef = useRef<[] | null>(null);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${fcomponent.getBaseURL()}/leaderboards`);
      if (leaderboardListRef.current === response.data) {
        return; // ไม่มีการเปลี่ยนแปลง
      }
      leaderboardListRef.current = response.data;
      setReport(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
  };
  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000); // 10 วินาที
    return () => clearInterval(interval);
  }, []);

  const filteredChats = report.filter((c) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();

    const descriptionMatch = c?.Description.toLowerCase().includes(searchLower);
    
    return descriptionMatch;
  });

  const renderDescription = (item:any) => {
    if (item.Description.length > 40)
      return item.Description.slice(0, 40)+"..."
    else return item.Description
  }

  const renderItem = ({ item }: {item:any}) => {
    return (
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-3 border-b border-blackpearl"
        onPress={() => navigate(`../systems/leaderboard_edit?id=${item.LeaderboardID}`)}
      >
        <View className="flex-row items-center">
          <View>
            <Text className="text-alabaster text-xl font-semibold">{renderDescription(item)}</Text>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>
              {item.Prize_Pool}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <HeaderBar
        title="Leaderboard List"
      />

      {/* Search */}
      <View className="px-4 mb-2">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-2 py-2">
          <MaterialCommunityIcons name="magnify" size={20} color="#888" />
          <TextInput
            className="flex-1 ml-1 text-blackpearl"
            placeholder="Search"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <TouchableOpacity
          className="bg-accent-200 rounded-2xl p-3 m-3"
          onPress={() => router.navigate("../systems/leaderboard")}
        >
          <Text className="text-blackpearl font-semibold text-center">สร้าง</Text>
      </TouchableOpacity>

      {/* list */}
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={(item) => item.LeaderboardID}
        />
    </ScreenWrapper>
  );
};

export default LeaderboardList;