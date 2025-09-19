import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

type Props = {
  image: ImageSourcePropType;
  label: string;
};

export default function FortuneTellerCard({ image, label }: Props) {
  return (
    <View className="w-24 h-40 rounded-lg mr-2 relative">
      <Image
        source={image}
        resizeMode="cover"
        className="w-full h-full rounded-lg"
      />
      <Text 
        className="absolute text-white bottom-1 left-1 w-3/4 text-sm"
        numberOfLines={2}
        ellipsizeMode="tail"
        style={{
            textShadowColor: "rgba(0, 0, 0, 0.8)", // shadow color
            textShadowOffset: { width: 1, height: 1 }, // x, y offset
            textShadowRadius: 3, // blur radius
          }}>
        {label}
      </Text>
    </View>
  );
}
