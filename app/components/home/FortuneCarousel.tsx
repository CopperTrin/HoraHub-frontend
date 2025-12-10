import { ScrollView } from "react-native";
import FortuneTellerCard from "./FortuneTellerCard";

type Fortune = {
  image?: any;
  label: string;
  onPress?: () => void;
};

type Props = {
  items: Fortune[];
};

export default function FortuneCarousel({ items }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row"
      className="h-40"
    >
      {items.map((f, i) => (
        <FortuneTellerCard key={i} image={f.image} label={f.label} onPress={f.onPress} />
      ))}
    </ScrollView>
  );
}
