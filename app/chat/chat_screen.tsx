// screens/ChatScreen.tsx
import ScreenWrapper from "@/app/components/ScreenWrapper";
import * as ImagePicker from "expo-image-picker";
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

// message interface
interface Message {
  id: string;
  text?: string;
  image?: string;
  sender: "me" | "other";
  avatar: string; // avatar จาก backend
}

// mock API base url
const API_URL = "https://example.com/api";

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // โหลดประวัติแชทเก่า
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/messages`);
        const data = await res.json();

        // สมมติ backend ส่งมาเป็น array ของ messages
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([
      {
        id: "1",
        sender: "other",
        text: "สวัสดีครับ!",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
    ]);
      }
    };

    fetchMessages();
  }, []);

  const sendMessage = async () => {
    if (input.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input.slice(0, 250), // จำกัดความยาวตัวอักษร
      sender: "me",
      avatar: "https://i.pravatar.cc/150?img=12", // 🔗 โหลดจาก backend จริงตอน login
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

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`flex-row items-end mb-3 ${
        item.sender === "me" ? "justify-end" : "justify-start"
      }`}
    >
      {item.sender === "other" && (
        <Image
          source={{ uri: item.avatar }}
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
        {item.text && (
            <View className={`max-w-[70%] p-3 rounded-lg ${item.sender === "me" ? "bg-blue-500" : "bg-gray-700"}`}>
                <Text className="text-white break-words">{item.text}</Text>
            </View>
        )}
        {item.image && (
          <Image
            source={{ uri: item.image }}
            className="w-60 h-60 rounded-lg mt-2"
          />
        )}
      {item.sender === "me" && (
        <Image
          source={{ uri: item.avatar }}
          className="w-8 h-8 rounded-full ml-2"
        />
      )}
    </View>
  );

   return (
    <ScreenWrapper>
        <HeaderBar title="ลุงเริง"showBack/>
        <KeyboardAvoidingView
        className="flex-1 bg-primary-200 p-4"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
        />

        {/* Input bar */}
        <View className="flex-row items-center border-t border-gray-600 p-2 bg-[#0D0822]">
            <TouchableOpacity
            onPress={sendImage}
            className="bg-gray-700 p-2 rounded-lg mr-2"
            >
            <Text className="text-white">📷</Text>
            </TouchableOpacity>

            <TextInput
            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg"
            placeholder="พิมพ์ข้อความ..."
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            multiline
            />

            <TouchableOpacity
            onPress={sendMessage}
            className="ml-2 bg-yellow-400 px-4 py-2 rounded-lg"
            >
            <Text className="text-black font-bold">ส่ง</Text>
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

export default ChatScreen;