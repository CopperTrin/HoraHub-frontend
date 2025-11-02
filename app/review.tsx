import ScreenWrapper from "@/app/components/ScreenWrapper";
import { FontAwesome } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import HeaderBar from "./components/ui/HeaderBar";
import fcomponent from "./fcomponent";

export default function ReviewScreen() {
  const [review, setReview] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [serviceName, setServiceName] = useState<string>("");
  const [serviceImage, setServiceImage] = useState<string>("");
  const [alreadyReviewed, setAlreadyReviewed] = useState<boolean>(false);

  const route = useRoute();
  const { serviceId } = route.params as { serviceId: string };
  const API_URL = fcomponent.getBaseURL();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await fcomponent.getToken();

        const res = await axios.get(`${API_URL}/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setServiceName(data.Service_name);
        setServiceImage(data.ImageURLs?.[0]);

        const myReviews = await axios.get(`${API_URL}/reviews/my-reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const found = myReviews.data?.find(
          (r: any) => r.ServiceID === serviceId
        );
        if (found) {
          setAlreadyReviewed(true);
          Alert.alert("รีวิวไปแล้ว", "คุณได้รีวิวบริการนี้ไปแล้ว", [
            {
              text: "ตกลง",
              onPress: () => router.push("/(tabs)/p2p"), 
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
      }
    };

    fetchData();
  }, []);

  const submitReview = async () => {
    if (alreadyReviewed) {
      Alert.alert("รีวิวไปแล้ว", "คุณได้รีวิวบริการนี้ไปแล้ว");
      return router.push("/(tabs)/p2p"); 
    }

    try {
      const token = await fcomponent.getToken();
      const response = await axios.post(
        `${API_URL}/reviews`,
        {
          Star: rating,
          Comment: review,
          ServiceID: serviceId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        Alert.alert("สำเร็จ", "รีวิวของคุณถูกส่งแล้ว", [
          {
            text: "ตกลง",
            onPress: () => router.replace("/(tabs)/p2p/mybooking/mybooking"),
          },
        ]);
      } else {
        Alert.alert("ผิดพลาด", "ไม่สามารถส่งรีวิวได้");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        Alert.alert("รีวิวไปแล้ว", "คุณได้รีวิวบริการนี้ไปแล้ว");
        return router.replace("/(tabs)/p2p/mybooking/mybooking");
      }
      console.error("Report error:", error);
      Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleRating = (value: number) => setRating(value);

  return (
    <ScreenWrapper>
      
      <HeaderBar title="Review" showBack />


      <View className="flex-1 bg-primary-200 items-center p-5">
        <Image
          source={{ uri: serviceImage }}
          className="w-[90px] h-[90px] rounded-full mt-5"
        />
        <Text className="text-alabaster text-lg font-bold my-4">{serviceName}</Text>

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

        <Text className="self-start text-alabaster text-sm mb-2">
          เขียนรีวิวของคุณ
        </Text>
        <TextInput
          className="w-full h-[150px] border border-yellow-400 rounded-lg p-3 text-white mb-5"
          placeholder="เขียนรีวิวของคุณที่นี่..."
          placeholderTextColor="#aaa"
          value={review}
          onChangeText={setReview}
          multiline
          scrollEnabled
          textAlign="left"
          textAlignVertical="top"
        />

        <TouchableOpacity
          className="bg-accent-200 w-full py-3 rounded-lg items-center"
          onPress={submitReview}
          disabled={alreadyReviewed}
        >
          <Text className="font-bold text-blackpearl text-base">
            {alreadyReviewed ? "รีวิวไปแล้ว" : "ส่งรีวิว"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
