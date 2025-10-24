import { useState } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

type Props = {
  images: ImageSourcePropType[];
  height?: number;                
  dotActiveClass?: string;       
  dotClass?: string;              
  onIndexChange?: (i: number) => void;
  onImagePress?: (index: number) => void;
};

export default function HomeNews({
  images,
  height = 240,
  dotActiveClass = "bg-accent-200",
  dotClass = "bg-alabaster",
  onIndexChange,
  onImagePress,
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
          <Pressable key={index} onPress={() => onImagePress?.(index)}>
            <Image
              source={img}
              style={{ width: screenWidth, height }}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>

      {/* Dot indicator */}
      <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
        {images.map((_, index) => (
          <View
            key={index}
            className={`w-2.5 h-2.5 mx-1 rounded-full ${activeIndex === index ? dotActiveClass : dotClass
              }`}
          />
        ))}
      </View>
    </View>
  );
}
