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

export default function ShopDashboardPage() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <HeaderBar
        title="My Shop"
        showChat
      />
    </ScreenWrapper>
  );
}
