import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";

type Props = {
  image?: ImageSourcePropType;
  label: string;
  onPress?: () => void;
};

export default function FortuneTellerCard({ image, label, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="w-24 h-40 rounded-lg mr-2 relative"
    >
      {image ? (
        <Image source={image} resizeMode="cover" className="w-full h-full rounded-lg" />
      ) : (
        <View className="w-full h-full rounded-lg bg-primary-100 items-center justify-center">
          <Text className="text-white/70 text-xs font-sans">ไม่มีรูป</Text>
        </View>
      )}

      <Text
        className="absolute text-white bottom-1 left-1 w-3/4 text-sm font-sans"
        numberOfLines={2}
        ellipsizeMode="tail"
        style={{
          textShadowColor: "rgba(0, 0, 0, 0.8)",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
