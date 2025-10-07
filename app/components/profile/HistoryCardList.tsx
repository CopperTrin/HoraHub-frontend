import { View } from "react-native";
import HistoryCard from "./HistoryCard";

type HistoryItem = {
  fortuneTellerName: string;
  status: "จองคิวแล้ว" | "สำเร็จ" | "ยกเลิก";
  profileImage: any; 
  horoscopeType: string;
  dateTime: string;
  price: string;
};

type HistoryCardListProps = {
  items: HistoryItem[];
};

export default function HistoryCardList({ items }: HistoryCardListProps) {
  return (
    <View className="flex flex-col gap-3">
      {items.map((item, index) => (
        <HistoryCard
          key={index}
          fortuneTellerName={item.fortuneTellerName}
          status={item.status}
          profileImage={item.profileImage}
          horoscopeType={item.horoscopeType}
          dateTime={item.dateTime}
          price={item.price}
        />
      ))}
    </View>
  );
}
