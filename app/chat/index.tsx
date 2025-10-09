
import ScreenWrapper from "@/app/components/ScreenWrapper";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from "axios";
import { navigate } from "expo-router/build/global-state/routing";
import { useEffect, useRef, useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import HeaderBar from "../components/ui/HeaderBar";
import fcomponent from "../fcomponent";
import { ChatRoomInfo } from "./chatroom_info";
import { Message } from "./message_info";
import profile from "./my_profile";

const ChatList = () => {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<ChatRoomInfo[]>([]);
  const chatListRef = useRef<[] | null>(null);

  const fetchChats = async () => {
    try {
      const token = await fcomponent.getToken();
      const response = await axios.get(`${fcomponent.getBaseURL()}/chat-conversations`, {headers: { Authorization: `Bearer ${token}` }});
      console.log("Fetched chats:", response.data);
      if (chatListRef.current === response.data) {
        return; // ไม่มีการเปลี่ยนแปลง
      }
      chatListRef.current = response.data;
      setChats(response.data);
      } catch (error) {
        console.log("Error fetching chats:", error);
      }
  };
  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000); // 5 วินาที
    return () => clearInterval(interval);
  }, []);

  // Filter chats by searching participant usernames (checks any participant's username)
  const myUsername = profile.useMyUsername();
  const filteredChats = chats.filter((c) => {
    if (!search) return true;

    const others = c?.Participants?.find((p) => p.User.Username !== myUsername)
      ?? c?.Participants?.[1]
      ?? c?.Participants?.[0];

    const searchLower = search.toLowerCase();

    return others?.User?.Username?.toLowerCase().includes(searchLower);
  });

  const other = (item: ChatRoomInfo, myUsername: string) => {
    if (!item?.Participants || !myUsername) return null;
    const found = item.Participants.find(
      (p) => p?.User?.Username?.toLowerCase() !== myUsername.toLowerCase()
    );
    return found ?? null;
  };

  const renderMessage = (item: Message) => {
    if (item.Content.length > 30)
      return item.Content.slice(0, 30)+"..."
    return item.Content
  }

  const renderItem = ({ item }: {item:ChatRoomInfo}) => {
    const otherUser = other(item, myUsername || '');
    if (!otherUser) return null;
    return (
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-3 border-b border-blackpearl"
        onPress={() => navigate(`../chat/chat_screen?chatId=${item.ConversationID}`)}
      >
        <View className="flex-row items-center">
          <Image
            source={{ uri: otherUser?.User.UserInfo.PictureURL ?? "" }}
            className="w-16 h-16 rounded-full mr-3"
          />
          <View>
            <Text className="text-alabaster text-xl font-semibold">{otherUser?.User.Username.slice(0, 25)}</Text>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>
              {item.Messages?.length > 0 ? (
              item.Messages[item.Messages.length - 1].MessageType === "IMAGE"
              ? "Sent a photo"
              : renderMessage(item.Messages[item.Messages.length - 1])) : ("No messages yet")}
            </Text>
          </View>
        </View>
        <Text className="text-gray-400 text-s">
          {fcomponent.formatChatTime(item.UpdatedAt)}
        </Text>
      </TouchableOpacity>
    )
  };

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