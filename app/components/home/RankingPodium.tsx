import { Image, ImageBackground, ImageSourcePropType, Text, View } from "react-native";

type PodiumItem = {
  image: ImageSourcePropType;
  name: string;
  rank: 1 | 2 | 3;  
  color: string;
};

type Props = {
  background: ImageSourcePropType;
  items: PodiumItem[]; 
  useGap?: boolean;     
};

export default function RankingPodium({ background, items, useGap = true }: Props) {

  const heightByRank: Record<PodiumItem["rank"], string> = {
    1: "h-20",
    2: "h-16",
    3: "h-12",
  };

  return (
    <View className="w-full h-60">
      <ImageBackground source={background} resizeMode="cover" className="w-full h-full">
        <View
          className={`flex-row w-full h-full items-end justify-center ${useGap ? "gap-2" : ""}`}
        >
          {items.map((item, idx) => (
            <View key={idx} className={!useGap ? "mx-2" : undefined}>
              <Image
                source={item.image}
                style={{ width: 48, height: 48, borderRadius: 32 }}
                className="self-center mb-1"
              />
              <Text className="text-white text-center mb-4 mt-2 text-sm w-24 font-sans" numberOfLines={2} ellipsizeMode="tail">
                {item.name}
              </Text>
              <View
                style={{ backgroundColor: item.color }}
                className={`w-20 ${heightByRank[item.rank]} justify-center self-center rounded-s`}
              >
                <Text className="self-center font-bold">{item.rank}</Text>
              </View>
            </View>
          ))}
        </View>
      </ImageBackground>
    </View>
  );
}
