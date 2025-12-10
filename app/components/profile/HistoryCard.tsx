import { Image, ImageSourcePropType, Text, View } from "react-native";

type HistoryCardProps = {
  fortuneTellerName: string;
  status: "จองคิวแล้ว" | "สำเร็จ" | "ยกเลิก";
  profileImage: ImageSourcePropType;
  horoscopeType: string;
  dateTime: string;
  endTimeText: string; 
  price: string;
};

export default function HistoryCard({
  fortuneTellerName,
  status,
  profileImage,
  horoscopeType,
  dateTime,
  endTimeText,
  price,
}: HistoryCardProps) {
  const statusColor = (() => {
    switch (status) {
      case "จองคิวแล้ว":
        return "text-yellow-400";
      case "สำเร็จ":
        return "text-green-400";
      case "ยกเลิก":
        return "text-red-400";
      default:
        return "text-white";
    }
  })();

  return (
    <View className="bg-primary-100 h-44 p-2.5 rounded-lg gap-4">
      {/* Header row */}
      <View className="flex flex-row justify-between">
        <Text
          className="text-white text-xl font-sans-medium w-72"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {fortuneTellerName}
        </Text>
        <Text
          className={`text-xl font-sans-medium ${statusColor}`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {status}
        </Text>
      </View>

      {/* Content row */}
      <View className="flex flex-row w-full">
        <Image
          source={profileImage}
          className="w-24 h-24 rounded-lg"
          resizeMode="cover"
        />

        <View className="flex-1 flex-col ml-2.5 mr-2.5">
          <Text className="text-white text-base font-sans" numberOfLines={1} ellipsizeMode="tail">
            {horoscopeType}
          </Text>

          {/* เวลาเริ่ม */}
          <Text className="text-white text-base font-sans" numberOfLines={1} ellipsizeMode="tail">
            {dateTime}
          </Text>

          {/* เวลาสิ้นสุด */}
          <Text className="text-white/80 text-base font-sans" numberOfLines={1} ellipsizeMode="tail">
            {endTimeText}
          </Text>

          <Text
            className="text-white text-base font-sans self-end mt-auto"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {price}
          </Text>
        </View>
      </View>
    </View>
  );
}
