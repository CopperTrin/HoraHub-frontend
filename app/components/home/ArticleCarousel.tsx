import React from "react";
import { ScrollView, ViewStyle } from "react-native";
import ArticleCard from "./ArticleCard";

type Item = {
  image: any;      // ImageSourcePropType
  title: string;
  author: string;
  onPress?: () => void;
};

type Props = {
  items: Item[];
  gap?: number;      // tailwind gap-? via class below (default 16)
  contentStyle?: ViewStyle;
  cardWidth?: number;
  cardHeight?: number;
};

export default function ArticleCarousel({
  items,
  gap = 16,
  contentStyle,
  cardWidth = 320,
  cardHeight = 256,
}: Props) {
  // Use contentContainerClassName to apply gap + row layout
  return (
    <ScrollView
      horizontal
      className="h-64"
      contentContainerClassName="flex-row"
      contentContainerStyle={[{ columnGap: gap }, contentStyle]}
      showsHorizontalScrollIndicator={false}
    >
      {items.map((it, idx) => (
        <ArticleCard
          key={idx}
          image={it.image}
          title={it.title}
          author={it.author}
          onPress={it.onPress}
          width={cardWidth}
          height={cardHeight}
        />
      ))}
    </ScrollView>
  );
}
