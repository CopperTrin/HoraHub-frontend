
import ScreenWrapper from "@/app/components/ScreenWrapper";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import HeaderBar from "../components/ui/HeaderBar";
import fcomponent from "../fcomponent";
import { ChatRoomInfo } from "./chatroom_info";

const ChatList = () => {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<ChatRoomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจาก backend
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = await fcomponent.getToken();
        const response = await axios.get(`${fcomponent.getBaseURL()}/chat-conversations`, {headers: { Authorization: `Bearer ${token}` }}); // 👈 เปลี่ยนเป็น endpoint จริง
        console.log("Fetched chats:", response.data);
        console.log("Fetched chats:", response.data.Messages[0]);
        setChats(response.data);
      } catch (error) {
        console.log("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const filteredChats = chats.filter((c) =>
    c.Participants[0].User.Username.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: {item:ChatRoomInfo}) => (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-3 border-b border-blackpearl"
      onPress={() => router.push({
        pathname: "./chat_screen",
        params: { chatId: item.ConversationID }
      })}
    >
      <View className="flex-row items-center">
        <Image
          source={{ uri: item.Participants[0].User.UserInfo.PictureURL }}
          className="w-16 h-16 rounded-full mr-3"
        />
        <View>
          <Text className="text-alabaster text-xl font-semibold">{item.Participants[0].User.Username}</Text>
          <Text className="text-gray-400 text-sm">
            {item.Messages?.length > 0 ? (
            item.Messages[item.Messages.length - 1].MessageType === "IMAGE"
            ? "Sent a photo"
            : item.Messages[item.Messages.length - 1].Content) : ("No messages yet")}
          </Text>
        </View>
      </View>
      <Text className="text-gray-400 text-s">
        {fcomponent.formatChatTime(item.UpdatedAt)}
      </Text>
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
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={(item) => item.ConversationID}
        />
    </ScreenWrapper>
  );
};

export default ChatList;