import { ScrollView, ViewStyle } from "react-native";
import ArticleCard from "./ArticleCard";

type Item = {
  image: any;     
  title: string;
  author: string;
  onPress?: () => void;
};

type Props = {
  items: Item[];
  gap?: number;     
  contentStyle?: ViewStyle;
  cardWidth?: number;
  cardHeight?: number;
};

export default function ArticleCarousel({
  items,
  gap = 16,
  contentStyle,
  cardWidth = 320,
  cardHeight = 272,
}: Props) {
  return (
    <ScrollView
      horizontal
      className="h-80"
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
