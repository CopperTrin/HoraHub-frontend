import ScreenWrapper from "@/app/components/ScreenWrapper";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from "axios";
import { navigate } from "expo-router/build/global-state/routing";
import { useEffect, useRef, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";
import fcomponent from "../../fcomponent";
import { Report } from "../chat-report/reportinfo";

const ReportList = () => {
  const [search, setSearch] = useState("");
  const [report, setReport] = useState<Report[]>([]);
  const reportListRef = useRef<[] | null>(null);

  const fetchChats = async () => {
    try {
      const token = await fcomponent.getToken();
      const response = await axios.get(`${fcomponent.getBaseURL()}/reports`, {headers: { Authorization: `Bearer ${token}` }});
      if (reportListRef.current === response.data) {
        return; 
      }
      reportListRef.current = response.data;
      setReport(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
  };
  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000); 
    return () => clearInterval(interval);
  }, []);


  const filteredChats = report.filter((c) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();

    const reportedMatch = c?.ReportedUser.Username.toLowerCase().includes(searchLower);
    const reporterMatch = c?.Reporter.Username.toLowerCase().includes(searchLower);
    const reasonMatch = c?.Reason.toLowerCase().includes(searchLower)
    
    return reportedMatch || reporterMatch || reasonMatch;
  });

  const renderDescription = (item: Report) => {
    if (item.Description.length > 40)
      return item.Description.slice(0, 40)+"..."
    else return item.Description
  }

  const renderItem = ({ item }: {item:Report}) => {
    return (
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-3 border-b border-blackpearl"
        onPress={() => navigate(`../chat-report/report_screen?reportId=${item.ReportID}`)}
      >
        <View className="flex-row items-center">
          <View>
            <Text className="text-alabaster text-xl font-semibold">{item.Reason.slice(0, 35)}</Text>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>
              {renderDescription(item)}
            </Text>
          </View>
        </View>
        <Text className="text-gray-400 text-s">
          {fcomponent.formatChatTime(item.CreatedAt)}
        </Text>
      </TouchableOpacity>
    )
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <HeaderBar
        title="Report List"
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

      {/* Report list */}
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={(item) => item.ReportID}
        />
    </ScreenWrapper>
  );
};

export default ReportList;