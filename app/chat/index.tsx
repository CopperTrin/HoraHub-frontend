
import ScreenWrapper from "@/app/components/ScreenWrapper";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { navigate } from "expo-router/build/global-state/routing";
import { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import HeaderBar from "../components/ui/HeaderBar";

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastmessage: string;
  lastdate: string;
}

const ChatList = () => {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจาก backend
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch("https://api.example.com/chats"); // 👈 เปลี่ยนเป็น endpoint จริง
        const data = await response.json();
        setChats(data); // backend ควรส่ง { id, name, avatar, lastMessage, lastDate }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
        setChats([
  {
    "id": "1",
    "name": "หมอนี",
    "avatar": "https://server.com/avatar1.png",
    "lastmessage": "Sent an attachment",
    "lastdate": "31/08"
  },
  {
    "id": "1",
    "name": "ลุงเจี๊ยบ",
    "avatar": "https://server.com/avatar2.png",
    "lastmessage": "สวัสดีครับ",
    "lastdate": "16/08"
  },
]);
      }
    };

    fetchChats();
  }, []);

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: {item:ChatItem}) => (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-3 border-b border-blackpearl"
      //onPress={() => navigation.navigate("ChatRoom", { chatId: item.id })}
      onPress={() => navigate("../chat/chat_screen")}
    >
      <View className="flex-row items-center">
        <Image
          source={{ uri: item.avatar }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View>
          <Text className="text-alabaster font-semibold">{item.name}</Text>
          <Text className="text-gray-400 text-sm">{item.lastmessage}</Text>
        </View>
      </View>
      <Text className="text-gray-400 text-xs">{item.lastdate}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      {/* Header */}
      <HeaderBar
        title="Chat"
        showBack
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

      {/* Chat list */}
      <ScrollView>
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ChatList;