import { Image, ImageSourcePropType, Pressable, Text, View } from "react-native";

type Props = {
  image: ImageSourcePropType;
  title: string;
  author: string;
  onPress?: () => void;
  width?: number;  
  height?: number; 
};

export default function ArticleCard({
  image,
  title,
  author,
  onPress,
  width = 320,
  height = 272,
}: Props) {
  return (
    <Pressable onPress={onPress} style={{ width, height }}>
      <View className="w-full h-full">
        <Image source={image} className="w-full h-44 rounded-lg" resizeMode="cover" />
        <Text
          className="text-white font-sans-medium mt-2 text-base ml-2"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text
          className="text-alabaster font-sans-medium mt-2 text-sm ml-2"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          โดย {author}
        </Text>
      </View>
    </Pressable>
  );
}
