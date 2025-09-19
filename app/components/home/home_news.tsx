import React, { useState } from "react";
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

type Props = {
  images: ImageSourcePropType[];
  height?: number;                 // default 240
  dotActiveClass?: string;         // tailwind class for active dot
  dotClass?: string;               // tailwind class for inactive dot
  onIndexChange?: (i: number) => void;
};

export default function HomeNews({
  images,
  height = 240,
  dotActiveClass = "bg-accent-200",
  dotClass = "bg-alabaster",
  onIndexChange,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
      onIndexChange?.(index);
    }
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((img, index) => (
          <Image
            key={index}
            source={img}
            style={{ width: screenWidth, height }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Dot indicator */}
      <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
        {images.map((_, index) => (
          <View
            key={index}
            className={`w-2.5 h-2.5 mx-1 rounded-full ${
              activeIndex === index ? dotActiveClass : dotClass
            }`}
          />
        ))}
      </View>
    </View>
  );
}
