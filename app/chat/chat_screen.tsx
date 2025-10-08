// screens/ChatScreen.tsx
import ScreenWrapper from "@/app/components/ScreenWrapper";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { navigate } from "expo-router/build/global-state/routing";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderBar from "../components/ui/HeaderBar";
import fcomponent from "../fcomponent";
import { ChatRoomInfo } from "./chatroom_info";
import { Message } from "./message_info";
import profile from "./my_profile";

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<ChatRoomInfo | null>(null);
  const [input, setInput] = useState("");
  const route = useRoute();
  const { chatId } = route.params as { chatId: string };
  const API_URL = fcomponent.getBaseURL();

  // โหลดประวัติแชทเก่า
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await fcomponent.getToken();
        const response = await axios.get(`${API_URL}/chat-conversations/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }});
        setChat(response.data);
        console.log("Fetched chat details:", response.data);
        const res = await axios.get(`${API_URL}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { conversationId: chatId },
        });
        console.log("Fetched messages:", res.data);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, []);

  const myUsername = profile.myUsername();
  const other = (item: ChatRoomInfo, myUsername: string) => {
    if (!item?.Participants || !myUsername) return null;
    const found = item.Participants.find(
      (p) => p?.User?.Username?.toLowerCase() !== myUsername.toLowerCase()
    );
    return found ?? null;
  };
  const otherUser = other(chat!, myUsername || '');

  const sendMessage = async () => { //ยังไม่เสร็จ
    if (input.trim().length === 0) return;

    const newMessage: Message = {
      ConversationID: chatId,
      Content: input.slice(0, 250),
    };

    // อัปเดต local state
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const sendImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newMessage: Message = {
        id: Date.now().toString(),
        image: result.assets[0].uri,
        sender: "me",
        avatar: "https://i.pravatar.cc/150?img=12", // 🔗 โหลดจาก backend จริง
      };

      setMessages((prev) => [...prev, newMessage]);

      // ส่งรูปไป backend
      const formData = new FormData();
      formData.append("image", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);

      try {
        await fetch(`${API_URL}/messages/image`, {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }
  };

  const ImageMessage = ({ fileURL }: { fileURL?: string }) => {
    const [error, setError] = useState(false);

    if (!fileURL) {
      return (
        <View className="items-center">
          <Text className="text-center text-blackpearl mb-1">Photo Unavailable</Text>
        </View>
      );
    }

    return (
      <View className="items-center">
        {error ? (
          <Text className="text-center text-alabaster mb-1">Photo Expired</Text>
        ) : (
          <Image
            source={{ uri: fileURL }}
            className="w-60 h-80 rounded-xl"
            onError={() => setError(true)}
            resizeMode="contain"
          />
        )}
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View
        className={`flex-row items-end mb-3 ${
          item.Sender.Username === myUsername ? "justify-end" : "justify-start"
        }`}
      >
        {item.Sender?.Username !== myUsername && (
          <Image
            source={{ uri: otherUser?.User.UserInfo.PictureURL }}
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        {item.MessageType === 'TEXT' && (
            <View className={`max-w-[70%] p-3 rounded-lg ${item.Sender.Username !== myUsername ? "bg-accent-100" : "bg-secondary-100"}`}>
                <Text className="text-blackpearl break-words">{item.Content}</Text>
            </View>
        )}
        {item.MessageType === 'IMAGE' && (
          <ImageMessage fileURL={item.FileURL} />
        )}
        {item.Sender?.Username === myUsername && (
          <Image
            source={{ uri: profile.myProfile()?.PictureURL }}
            className="w-8 h-8 rounded-full ml-2"
          />
        )}
      </View>
    );
  };

  const [inputHeight, setInputHeight] = useState(36);
  const handleSend = () => {
    sendMessage();
    setInputHeight(36);
  };

   return (
    <ScreenWrapper>
      <HeaderBar 
        title={chat ? chat.Participants[0].User.Username : "Chat"}
        showBack
        rightIcons={[{ name: "error-outline", onPress: () => navigate("../chat/report") }]}/>
      <KeyboardAvoidingView
        className="flex-1 bg-primary-100"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <FlatList
        className="p-4"
        data={messages}
        keyExtractor={(item) => item.MessageID}
        renderItem={renderMessage}
      />

      {/* Input bar */}
      <View className="flex-row items-center border-t p-2 bg-primary-200">
        <TouchableOpacity
          onPress={sendImage}
          className="bg-primary-200 p-2 mr-1 mb-2 mt-2">
          <MaterialCommunityIcons name="image-plus" size={24} color='#FFD824'/>
        </TouchableOpacity>

        <TextInput
          className="flex-1 bg-yellow-200 text-black px-3 py-2 rounded-lg mb-2 mt-2"
          placeholder="พิมพ์ข้อความสูงสุดที่ 250 ตัวอักษร..."
          placeholderTextColor="gray"
          value={input}
          onChangeText={(text) => setInput(text.slice(0, 250))}
          multiline
          scrollEnabled={inputHeight >= 96} // scroll เมื่อกล่องถึง max
          textAlign="left"
          textAlignVertical="center"
          style={{
            minHeight: 36,
            maxHeight: 96,
            height: inputHeight,
          }}
          onContentSizeChange={(e) => {
            const newHeight = e.nativeEvent.contentSize.height;
            setInputHeight(Math.min(newHeight, 96)); // สูงสุด 120px
          }}
        />

        <TouchableOpacity
          onPress={handleSend}
          className="ml-2 bg-primary-200 px-1 py-2 mb-2 mt-2"
          >
          <MaterialCommunityIcons name="send-variant-outline" size={26} color='#FFD824' />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </ScreenWrapper>
  );
}

export default ChatScreen;