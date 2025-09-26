import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text, ScrollView, Image, FlatList, TouchableOpacity } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";
import { useMemo } from "react";
import { useRouter } from "expo-router";
// --- Images for Recommended Users ---
import fortune_teller_1 from "@/assets/images/home/fortune_teller_1.png";
import fortune_teller_2 from "@/assets/images/home/fortune_teller_2.png";
import fortune_teller_3 from "@/assets/images/home/fortune_teller_3.png";
import fortune_teller_4 from "@/assets/images/home/fortune_teller_4.png";
import fortune_teller_5 from "@/assets/images/home/fortune_teller_3.png";
import fortune_teller_6 from "@/assets/images/home/fortune_teller_4.png";

// --- Images for P2P Users (Example imports, please change to your actual files) ---
import p2p_user_1 from "@/assets/images/p2p/ft2.png";
import p2p_user_2 from "@/assets/images/p2p/ft2.png";
import p2p_user_3 from "@/assets/images/p2p/ft2.png";
import p2p_user_4 from "@/assets/images/p2p/ft2.png";
import p2p_user_5 from "@/assets/images/p2p/ft2.png";
import p2p_user_6 from "@/assets/images/p2p/ft2.png";
import p2p_user_7 from "@/assets/images/p2p/ft2.png";
import p2p_user_8 from "@/assets/images/p2p/ft2.png";
import p2p_user_9 from "@/assets/images/p2p/ft2.png";


// --- Mock Data ---
// You can replace this with data from your API
const recommendedUsers = [
  { id: '1', imageUrl: fortune_teller_1 },
  { id: '2', imageUrl: fortune_teller_2 },
  { id: '3', imageUrl: fortune_teller_3 },
  { id: '4', imageUrl: fortune_teller_4 },
  { id: '5', imageUrl: fortune_teller_5 },
  { id: '6', imageUrl: fortune_teller_6 },
];

const p2pUsers = [
  { id: '1', name: 'Dr.ช้าง', imageUrl: p2p_user_1, available: true },
  { id: '2', name: 'Dr.ลักษณ์', imageUrl: p2p_user_2, available: true },
  { id: '3', name: 'Dr.ปลาย', imageUrl: p2p_user_3, available: true },
  { id: '4', name: 'Dr.คฑา', imageUrl: p2p_user_4, available: true },
  { id: '5', name: 'Dr.วั้ง อินดี้', imageUrl: p2p_user_5, available: false },
  { id: '6', name: 'Dr.นาค', imageUrl: p2p_user_6, available: true },
  { id: '7', name: 'Dr.บาบา วานก้า', imageUrl: p2p_user_7, available: false },
  { id: '8', name: 'Dr.ไนท์ เชื่อมจิต', imageUrl: p2p_user_8, available: true },
  { id: '9', name: 'Dr.โก๊ะ ตาทิพย์', imageUrl: p2p_user_9, available: true },
];
// --- End Mock Data ---

// --- Components ---
const AvailabilityBadge = ({ available }) => {
  if (!available) return null;
  return (
    <View className="absolute top-2 right-2 bg-green-500/80 rounded-full px-2 py-1 flex-row items-center border border-white/50">
      <View className="w-2 h-2 bg-white rounded-full mr-1.5"></View>
      <Text className="text-white text-xs font-bold">ว่าง</Text>
    </View>
  );
};

const UserCard = ({ item, onPress }) => (
  <TouchableOpacity className="w-[48%] mb-4 active:opacity-75" onPress={onPress}>
    <View className="bg-[#2D2A32] rounded-2xl overflow-hidden shadow-lg">
      <Image
        source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl}
        className="w-full h-48"
        resizeMode="cover"
      />
      <AvailabilityBadge available={item.available} />
      <Text className="text-center text-yellow-400 p-2 font-semibold">{item.name}</Text>
    </View>
  </TouchableOpacity>
);

const RecommendedCircle = ({ item, onPress }) => (
    <TouchableOpacity className="items-center mx-2 active:opacity-75" onPress={onPress}>
        <View className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 to-purple-500">
             <Image
                source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl}
                className="w-full h-full rounded-full border-2 border-[#1A181D]"
            />
        </View>
    </TouchableOpacity>
);


export default function P2pPage() {
  const router = useRouter();

  const handleProfilePress = (userId) => {
    router.push(`/p2p/${userId}`);
  };

  const memoizedHeader = useMemo(() => (
    <>
      <Text className="text-yellow-400 text-lg font-bold my-2 text-center">Recommend</Text>
      <View className="mb-4">
        <FlatList
            data={recommendedUsers}
            renderItem={({item}) => <RecommendedCircle item={item} onPress={() => handleProfilePress(item.id)} />}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
        />
      </View>
    </>
  ), []);

  return (
    <ScreenWrapper>
      <HeaderBar
        title="P2P"
        rightIcons={[
          { name: "calendar-month", onPress: () => console.log("Booking tapped") },
        ]}
        showSearch
        showChat
        onSearchSubmit={(query) => {
          console.log("ค้นหา:", query);
        }}
      />
      <View className="flex-1">
         <FlatList
            data={p2pUsers}
            renderItem={({item}) => <UserCard item={item} onPress={() => handleProfilePress(item.id)} />}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8 }}
            ListHeaderComponent={memoizedHeader}
            contentContainerStyle={{ paddingTop: 8 }}
        />
      </View>
    </ScreenWrapper>
  );
}

