import ScreenWrapper from "@/app/components/ScreenWrapper";
import { FontAwesome } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { navigate } from "expo-router/build/global-state/routing";
import { useEffect, useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import HeaderBar from "./components/ui/HeaderBar";
import fcomponent from "./fcomponent";

export default function ReviewScreen() {
  const [review, setReview] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [serviceName, setServiceName] = useState<string>("");
  const [serviceImage, setServiceImage] = useState<string>("");
  const route = useRoute();
  const { serviceId } = route.params as { serviceId: string };
  const API_URL = fcomponent.getBaseURL();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await fcomponent.getToken();
        const res = await axios.get(`${API_URL}/reviews/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data
        setServiceName(data.Service_name);
        setServiceImage(data.ImageURLs[0]);
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
      }
    };

    fetchData();
  }, []);

  const submitReview = async () => {
    try {
      const token = await fcomponent.getToken();
      const response = await axios.post(`${API_URL}/reviews`,
        {Star: rating,
          Comment: review,
          ServiceID: serviceId},
        {headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" }
        });

        if (response.status) {
          Alert.alert("สำเร็จ", "รีวิวของคุณถูกส่งแล้ว");
          navigate("./(tabs)");
        } else {
          Alert.alert("ผิดพลาด", "ไม่สามารถส่งรีวิวได้");
        }
    }
    catch(error){
      console.error("Report error:", error);
      Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleRating = (value: number) => {
    setRating(value);
  };

  return (
    <ScreenWrapper>
      <HeaderBar 
      title="Review"
      showBack
      />
      <View className="flex-1 bg-primary-200 items-center p-5">
        {/* Avatar */}
        <Image
          source={{ uri: serviceImage }}
          className="w-[90px] h-[90px] rounded-full mt-5"
        />

        {/* Title */}
        <Text className="text-alabaster text-lg font-bold my-4">{serviceName}</Text>

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
        <Text className="self-start text-alabaster text-sm mb-2">เขียนรีวิวของคุณ</Text>
        <TextInput
          className="w-full h-[150px] border border-yellow-400 rounded-lg p-3 text-white mb-5"
          placeholder="เขียนรีวิวของคุณที่นี่..."
          placeholderTextColor="#aaa"
          value={review}
          onChangeText={(text: string) => setReview(text)}
          multiline
          scrollEnabled={true}
          textAlign="left"
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          className="bg-accent-200 w-full py-3 rounded-lg items-center"
          onPress={() => submitReview()}
        >
          <Text className="font-bold text-blackpearl text-base">Submit</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}