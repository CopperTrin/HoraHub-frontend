import ScreenWrapper from "@/app/components/ScreenWrapper";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text } from "react-native";
import { CONTENT_BY_SLUG } from "./article_mockup";
// import the same images here
import article_1 from "@/assets/images/home/article_1.png";
import article_2 from "@/assets/images/home/article_2.png";
import article_3 from "@/assets/images/home/article_3.jpg";
import home_new_01 from "@/assets/images/home/home_new_01.png";
import home_new_02 from "@/assets/images/home/home_new_02.jpg";
import home_new_03 from "@/assets/images/home/home_new_03.jpg";

const IMAGE_BY_SLUG: Record<string, any> = {
  "six-top-astro": article_1,
  "how-to-tarot": article_2,
  "4-signs-promo": article_3,
  "4-signs-promo-extended": article_3,
  "august-topup-promo": home_new_01,
  "why-people-like-horoscope": home_new_02,
  "september-horoscope": home_new_03,
};

export default function ArticleDetail() {
    const { slug, title, author } = useLocalSearchParams<{
      slug: string; title?: string; author?: string;
    }>();
  
    const src = slug ? IMAGE_BY_SLUG[String(slug)] : undefined;
    const content = slug ? CONTENT_BY_SLUG[String(slug)] : undefined;
  
    return (
      <ScreenWrapper>
        <Stack.Screen options={{ title: title ?? String(slug) }} />
        <ScrollView className="flex-1 bg-primary px-4 py-4">
          {src ? (
            <Image
              source={src}
              className="w-full h-56 rounded-xl mb-4"
              resizeMode="cover"
            />
          ) : null}
  
          <Text className="text-white text-2xl font-bold">{title ?? slug}</Text>
          {author ? (
            <Text className="text-alabaster mt-2">โดย {author}</Text>
          ) : null}
  
          <ScrollView className="mt-4">
            {content ?? (
              <Text className="text-white">{content}</Text>
            )}
          </ScrollView>
        </ScrollView>
      </ScreenWrapper>
    );
  }
