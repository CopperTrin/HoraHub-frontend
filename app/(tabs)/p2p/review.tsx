import React from "react";
import { View, Text, ScrollView } from "react-native";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "@/app/components/ui/HeaderBar";

type ReviewProps = {
  name: string;
  date: string;
  rating: number; // 0-5
  review: string;
};

const Stars = ({ rating }: { rating: number }) => {
  const rounded = Math.round(rating);
  const full = "★".repeat(rounded);
  const empty = "☆".repeat(5 - rounded);
  return (
    <Text className="text-yellow-400 text-base">
      {full}
      <Text className="text-gray-500">{empty}</Text>
    </Text>
  );
};



const ReviewCard = ({ name, date, rating, review }: ReviewProps) => (
  <View className="bg-[#1C0033] rounded-2xl p-6 w-full mb-6">
    {/* คะแนนรวม */}
    <View className="items-center mb-4">
      <Text className="text-4xl font-bold text-yellow-400">{rating.toFixed(1)}</Text>
      <View className="mt-2">
        <Stars rating={rating} />
      </View>
      <Text className="text-gray-300 text-sm mt-1">{date}</Text>
    </View>

    {/* รีวิวข้อความ */}
    <Text className="text-gray-200 text-base italic mb-4">"{review}"</Text>

    {/* ข้อมูลผู้รีวิว */}
    <View className="flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-full bg-purple-500 items-center justify-center">
        <Text className="text-white font-bold text-sm">{name.charAt(0)}</Text>
      </View>
      <View>
        <Text className="font-semibold text-white">{name}</Text>
        <Text className="text-xs text-gray-400">User</Text>
      </View>
    </View>
  </View>
);

export default function ReviewPage() {
  const reviews: ReviewProps[] = [
    { name: "Mr.Sun", date: "2 ตุลาคม 2025", rating: 3.9, review: "ใช้งานได้ดี ฟีเจอร์ครบ แต่บางครั้งโหลดช้านิดหน่อย" },
    { name: "Mr.Day", date: "28 กันยายน 2025", rating: 4.5, review: "สีสวยงาม ใช้งานง่ายมากครับ ประทับใจสุด ๆ" },
  ];

  return (
    <ScreenWrapper>
      {/* ใช้ HeaderBar ตามที่ขอ */}
      <HeaderBar
        title="P2P"
        rightIcons={[
          { name: "calendar-month", onPress: () => console.log("Booking tapped") },
        ]}
        showSearch
        showChat
        showBack
      />

      <ScrollView className="bg-[#140E25] flex-1 px-5 py-6">
        <Text className="text-white text-xl font-bold mb-4">Review</Text>
        {reviews.map((r, i) => (
          <ReviewCard key={i} {...r} />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}
