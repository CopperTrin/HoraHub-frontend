import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";
import { useRouter } from "expo-router";

const products = [
  {
    id: "2",
    name: "เครื่องรางศาลเจ้าตะไพุที",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
  },
  {
    id: "3",
    name: "องค์ท้าวเวสสุวรรณ ปัดเป่าสิ่งsgdrgdrgdrg",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
  },
  {
    id: "4",
    name: "พระเครื่อง",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
  },
  {
    id: "5",
    name: "พระเครื่อง",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
  },
  {
    id: "6",
    name: "พระเครื่อง",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
  },
];

export default function ShopPage() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <HeaderBar
        title="Shop"
        showSearch
        showChat
        onSearchSubmit={(query) => {
          console.log("ค้นหา:", query);
        }}
      />

      <ScrollView 
        contentContainerStyle={{ 
          paddingHorizontal: 8, 
          paddingBottom : 20
        }}
      >
        <View className="flex-row flex-wrap justify-between">
          {products.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-primary-100 rounded-xl overflow-hidden mb-3"
              style={{
                width: "49%", 
              }}
              onPress={() => router.push(`/(tabs)/shop/${item.id}`)}
            >
              <Image
                source={{ uri: item.image }}
                className="h-40 w-full"
                resizeMode="cover"
              />
              <View className="p-3 flex-col justify-between" style={{ minHeight: 84 }}>
                <Text className="text-alabaster" numberOfLines={2}>
                  {item.name}
                </Text>
                <Text className="text-accent-200 font-bold text-right text-xl">
                  ฿{item.price}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
