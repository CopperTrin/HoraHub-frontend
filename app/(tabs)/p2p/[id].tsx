import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";
import { useLocalSearchParams, useRouter } from "expo-router";

// --- Images for P2P Users (Example imports, please change to your actual files) ---
import p2p_user_1 from "@/assets/images/p2p/ft1.png";
import p2p_user_2 from "@/assets/images/p2p/ft1.png";
import p2p_user_3 from "@/assets/images/p2p/ft1.png";
import p2p_user_4 from "@/assets/images/p2p/ft1.png";
import p2p_user_5 from "@/assets/images/p2p/ft1.png";
import p2p_user_6 from "@/assets/images/p2p/ft1.png";
import p2p_user_7 from "@/assets/images/p2p/ft1.png";
import p2p_user_8 from "@/assets/images/p2p/ft1.png";
import p2p_user_9 from "@/assets/images/p2p/ft1.png";

const p2pUsers = [
  { 
    id: '1', name: 'Dr.ช้าง', imageUrl: p2p_user_1, 
    rate: '30 Baht / 10Min', rating: 4.8, reviews: 251,
    description: 'หมอช้าง ทศพร ศรีตุลา เป็นนักพยากรณ์ชื่อดังของประเทศไทย มีความเชี่ยวชาญในโหราศาสตร์ไทยและจีน โดยเฉพาะการดูดวงจากวันเดือนปีเกิดและลายมือ ได้รับความนิยมอย่างกว้างขวางจากผลงานการเขียนหนังสือและออกรายการโทรทัศน์มากมาย'
  },
  { 
    id: '2', name: 'Dr.ลักษณ์', imageUrl: p2p_user_2,
    rate: '20 Baht / 10Min', rating: 5.0, reviews: 512,
    description: 'หมอลักษณ์ ฟันธง หรือชื่อจริงว่า ไพฑูรย์ อ่อนบัว เกิดเมื่อวันที่ 1 กันยายน พ.ศ. 2514 ที่จังหวัดปราจีนบุรี เริ่มต้นการศึกษาในระดับประถมที่โรงเรียนวัดหัวกรด ต่อด้วยมัธยมที่โรงเรียนนวมราชานุสรณ์ จากนั้นเข้าศึกษาระดับปริญญาตรี คณะ:เศรษฐศาสตร์ธุรกิจ มหาวิทยาลัยหอการค้าไทย และปริญญาโทที่คณะ:พุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย หมอลักษณ์เป็นนักโหราศาสตร์ชื่อดังของเมืองไทย มีชื่อเสียงจากการพยากรณ์ดวงชะตาและมักใช้วลี “ฟันธง” จนกลายเป็นเอกลักษณ์'
  },
  { 
    id: '3', name: 'Dr.ปลาย', imageUrl: p2p_user_3,
    rate: '25 Baht / 10Min', rating: 4.9, reviews: 330,
    description: 'หมอปลาย พรายกระซิบ มีชื่อเสียงด้านการทำนายเหตุการณ์บ้านเมืองและวงการบันเทิงได้อย่างแม่นยำ มีความสามารถพิเศษในการสื่อสารกับสิ่งลี้ลับและให้คำแนะนำในการแก้ไขปัญหาต่างๆ ผ่านการดูดวง'
  },
  { id: '4', name: 'Dr.กร', imageUrl: p2p_user_4, rate: '20 Baht / 10Min', rating: 4.7, reviews: 180, description: 'dwgwdgwdhwhdwhwhwhwhcvwdgwh' },
  { id: '5', name: 'Dr.วั้งจินต์', imageUrl: p2p_user_5, rate: '20 Baht / 10Min', rating: 4.8, reviews: 210, description: 'gdwfhdewjueghriugdwhvnjrqhgoirhbihqjjuioqkrhiwyi2oht' },
  { id: '6', name: 'Dr.นาค', imageUrl: p2p_user_6, rate: '20 Baht / 10Min', rating: 4.6, reviews: 150, description: 'egewhguguefqenkgihoiugkr3oihyoqrnihetjhgohygrq3iotyo' },
  { id: '7', name: 'Dr.บ่าบ๋า อ่านคำ', imageUrl: p2p_user_7, rate: '20 Baht / 10Min', rating: 4.9, reviews: 400, description: 'ge2ihgoughiorghrijfgjrihwiofuhpotjw4hkj4topjnhpotwjoptek5j' },
  { id: '8', name: 'Dr.ไบท์ เลื่อนจิต', imageUrl: p2p_user_8, rate: '20 Baht / 10Min', rating: 4.8, reviews: 320, description: 'kr3jtorighroigorihuruporohjrqjhopjrhoprj3hj3hpoj' },
  { id: '9', name: 'Dr.โต๊ะ ตาทิพย์', imageUrl: p2p_user_9, rate: '20 Baht / 10Min', rating: 4.9, reviews: 450, description: 'rkhjrjcojgojr3ohjufehuhpor3mhrjhoprjuhpokqhgiphgiqu32tgpi3qu' },
];
// --- End Mock Data ---


export default function P2pPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Find user by id from the mock data.
  const user = p2pUsers.find((p) => p.id === id);

  // Render a not found screen if user doesn't exist.
  if (!user) {
    return (
      <ScreenWrapper>
        <HeaderBar title="ไม่พบหมอดู" showBack onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center bg-[#1A181D]">
          <Text className="text-white text-lg">ไม่พบข้อมูลหมอดูที่คุณค้นหา</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Render the detail page for the user.
  return (
    <ScreenWrapper>
      <HeaderBar title={user.name} showBack onBackPress={() => router.back()} showChat />
      <ScrollView className="bg-primary-200" contentContainerStyle={{ paddingBottom: 32 }}>
        <Image source={user.imageUrl} className="w-full h-80" resizeMode="cover" />
        <View className="p-4">
          
          <Text className="text-white text-3xl font-bold mb-1">{user.name}</Text>
          
          <View className="flex-row justify-between items-center mb-4">
             <Text className="text-yellow-400 text-xl font-bold">{user.rate}</Text>
            <View className="flex-row items-center">
              <Text className="text-yellow-400 text-lg mr-1">⭐</Text>
              <Text className="text-white text-lg font-semibold">{user.rating.toFixed(1)} <Text className="text-gray-400">({user.reviews} Reviews)</Text></Text>
            </View>
          </View>

          <View className="bg-[#2D2A32] p-4 rounded-xl mb-8">
            <Text className="text-gray-300 text-base leading-6">{user.description}</Text>
          </View>

          <TouchableOpacity
            className="bg-purple-600 py-4 rounded-xl active:bg-purple-700 shadow-lg shadow-purple-500/50"
            onPress={() => console.log("Booking for:", user.name)}
          >
            <Text className="text-center text-white text-xl font-bold">
              Booking
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

