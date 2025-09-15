import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import "./global.css";

export default function ReviewScreen() {
  const [review, setReview] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("");
  const [userImage, setUserImage] = useState<string>("");

  useEffect(() => {
    // mock API (รอเปลี่ยนเป็น backend จริง)
    const fetchData = async () => {
      try {
        // สมมติว่า backend จะส่ง { name: "...", avatar: "..." }
        const response = await fetch("https://mockapi.io/api/v1/user/1");
        const data = await response.json();
        setUserName(data.name);
        setUserImage(data.avatar);
      } catch (error) {
        console.error("Error fetching user:", error);
        // fallback เผื่อโหลดไม่ได้
        setUserName("Bleach Ghost Ambassador");
        setUserImage("https://i.imgur.com/9bK0n7C.png");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRating = (value: number) => {
    setRating(value);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#FFD700" />
        <Text className="text-white mt-3">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary-200 items-center p-5">
      {/* Avatar */}
      <Image
        source={{ uri: userImage }}
        className="w-[90px] h-[90px] rounded-full mt-5"
      />

      {/* Title */}
      <Text className="text-alabaster text-lg font-bold my-4">{userName}</Text>

      {/* Stars */}
      <View className="flex-row mb-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleRating(star)}>
            <FontAwesome
              name={star <= rating ? "star" : "star-o"}
              size={28}
              color="#FFD700"
              style={{ marginHorizontal: 3 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Review */}
      <Text className="self-start text-alabaster text-sm mb-2 font-main">Write your review</Text>
      <TextInput
        className="w-full min-h-[100px] border border-yellow-400 rounded-lg p-3 text-white mb-5"
        placeholder="เขียนรีวิวของคุณที่นี่..."
        placeholderTextColor="#aaa"
        value={review}
        onChangeText={(text: string) => setReview(text)}
        multiline
      />

      {/* Submit */}
      <TouchableOpacity
        className="bg-accent-200 w-full py-3 rounded-lg items-center"
        onPress={() => console.log("Rating:", rating, "Review:", review)}
      >
        <Text className="font-bold text-blackpearl text-base">Submit</Text>
      </TouchableOpacity>
    </View>
  );
}