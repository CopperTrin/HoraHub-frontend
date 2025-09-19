import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";


const products = [
  {
    id: "2",
    name: "เครื่องรางศาลเจ้าตะไพุที",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
    description:'ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj'
  },
  {
    id: "3",
    name: "องค์ท้าวเวสสุวรรณ ปัดเป่าสิ่งsgdrgdrgdrg",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
    description:'ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj'
  },
  {
    id: "4",
    name: "พระเครื่อง",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
    description:'ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj'
  },
  {
    id: "5",
    name: "พระเครื่อง",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
    description:'ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj'
  },
  {
    id: "6",
    name: "พระเครื่อง",
    price: 1000,
    image: "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsbKFwqziPTZ1PXtPv8BZeY1d7EqqiONujhKvl9ZY5ivzYt8hfl2U6l.jpg",
    description:'ajwldkjawlkjdlkawjdkjawlkjdklawjdklawjlkdjlakwjdkawjdklj'
  },
];

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <ScreenWrapper>
        <HeaderBar title="ไม่พบสินค้า" showBack showChat/>
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">ไม่พบข้อมูลสินค้านี้</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title={product.name} showBack showChat/>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Image
          source={{ uri: product.image }}
          className="w-full h-64 rounded-xl mb-4"
          resizeMode="cover"
        />
        <Text className="text-alabaster text-xl font-bold mb-2">
          {product.name}
        </Text>
        <Text className="text-accent-200 text-2xl font-bold mb-4">
          ฿{product.price}
        </Text>
        <Text className="text-white text-base leading-6 mb-6">
          {product.description}
        </Text>

        <TouchableOpacity
          className="bg-accent-200 py-3 rounded-xl"
          onPress={() => console.log("กดซื้อ:", product.name)}
        >
          <Text className="text-center text-primary-100 text-lg font-bold">
            ซื้อสินค้า
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
