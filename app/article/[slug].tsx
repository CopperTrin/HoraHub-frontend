import { Stack, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    "august-topup-promo": home_new_03,
    "why-people-like-horoscope": home_new_02,
    "september-horoscope": home_new_01,
};

export default function ArticleDetail() {
    const { slug, title, author } = useLocalSearchParams<{
        slug: string; title?: string; author?: string;
    }>();

    const src = slug ? IMAGE_BY_SLUG[String(slug)] : undefined;
    const content = slug ? CONTENT_BY_SLUG[String(slug)] : undefined;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0f0b1b" }} edges={["left","right","bottom"]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: title ?? String(slug),
                    headerBackTitle: "กลับ",
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: "#0f0b1b" }, 
                    headerTransparent: false,
                    headerTitleStyle: {
                        fontFamily: "NotoSansThaiBold",
                        fontSize: 18,
                        color: "white",
                      },
                }}
            />
            
            <ScrollView className="flex-1 bg-primary px-4 py-4">
                {src ? (
                    <Image
                        source={src}
                        className="w-full h-56 rounded-xl mb-4"
                        resizeMode="cover"
                    />
                ) : null}

                <Text className="text-white text-2xl font-sans-bold">{title ?? slug}</Text>
                {author ? (
                    <Text className="text-alabaster mt-2 font-sans-medium">โดย {author}</Text>
                ) : null}

                <ScrollView className="mt-4">
                    {content ?? (
                        <Text className="text-white font-sans">{content}</Text>
                    )}
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
}
