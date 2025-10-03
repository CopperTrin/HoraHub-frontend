import ScreenWrapper from "@/app/components/ScreenWrapper";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import HeaderBar from "../../components/ui/HeaderBar";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons"

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

export default function ShopDashboardPage() {
  const router = useRouter();

    return (
    <ScreenWrapper>
      <HeaderBar
        title="Fortune teller"
        showChat
      />
      <ScrollView 
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom : 20,
          paddingTop:8
        }}
      >
      <View className="flex-1">

        {/* เมนูปุ่มกด */}
        <TouchableOpacity
          className="bg-primary-100 flex-row items-center justify-between rounded-full px-5 py-4 mb-4"
          onPress={() => router.push("/(fortune-teller)/shop/create_product")}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="add-box" size={20} color="white" />
            <Text className="text-alabaster text-base font-semibold ml-3">Create new product</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="white" />
        </TouchableOpacity>

        {/* แสดงรายการสินค้า */}
        <View className="space-y-3">
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              className="bg-primary-100 rounded-2xl flex-row p-2 mb-2"
              onPress={() => router.push(`/(fortune-teller)/shop/${product.id}`)}
            >
              {/* รูปสินค้า */}
              <Image
                source={{ uri: product.image }}
                className="w-24 h-24 rounded-xl"
                resizeMode="cover"
              />
              
              {/* ข้อมูลสินค้า */}
              <View className="flex-1 ml-4 justify-center">
                <Text
                  className="text-alabaster font-medium"
                  numberOfLines={2}
                >
                  {product.name}
                </Text>
                <Text className="text-yellow-400 text-base font-bold mt-2">
                  ฿{product.price.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

       
      </View>
      </ScrollView>
    </ScreenWrapper>
  )
}
