import ArticleCarousel from "@/app/components/home/ArticleCarousel";
import FortuneCarousel from "@/app/components/home/FortuneCarousel";
import HomeNews from "@/app/components/home/HomeNews";
import RankingPodium from "@/app/components/home/RankingPodium";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import article_1 from "@/assets/images/home/article_1.png";
import article_2 from "@/assets/images/home/article_2.png";
import article_3 from "@/assets/images/home/article_3.jpg";
import fortune_teller_1 from "@/assets/images/home/fortune_teller_1.png";
import fortune_teller_2 from "@/assets/images/home/fortune_teller_2.png";
import fortune_teller_3 from "@/assets/images/home/fortune_teller_3.png";
import fortune_teller_4 from "@/assets/images/home/fortune_teller_4.png";
import home_new_01 from "@/assets/images/home/home_new_01.png";
import home_new_02 from "@/assets/images/home/home_new_02.jpg";
import home_new_03 from "@/assets/images/home/home_new_03.jpg";
import ranking_bg from "@/assets/images/home/ranking_bg.png";
import { Asset } from "expo-asset";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function HomePage() {
  const images = [home_new_03, home_new_02, home_new_01];
  const fortuneTellers = [
    { image: fortune_teller_1, label: "หมอบี" },
    { image: fortune_teller_2, label: "อาจารย์แดง" },
    { image: fortune_teller_3, label: "อาจารย์ไม้ร่ม" },
    { image: fortune_teller_4, label: "แพรร์รี่" },
    { image: fortune_teller_1, label: "หมอบี" },
    { image: fortune_teller_2, label: "อาจารย์แดง" },
    { image: fortune_teller_3, label: "อาจารย์ไม้ร่ม" },
    { image: fortune_teller_4, label: "แพรร์รี่" },
    { image: fortune_teller_1, label: "หมอบี" },
    { image: fortune_teller_2, label: "อาจารย์แดง" },
    { image: fortune_teller_3, label: "อาจารย์ไม้ร่ม" },
    { image: fortune_teller_4, label: "แพรร์รี่" },
  ];
  const podiumItems = [
    {
      image: fortune_teller_1,
      name: "หมอบีหมอบีหมอบีหมอบีหมอบีหมอบีหมอบีหมอบีหมอบี",
      rank: 2,
      color: "#C7C7C7",
    },
    {
      image: fortune_teller_3,
      name: "อาจารย์ไม้ร่ม",
      rank: 1,
      color: "#FFD824",
    },
    {
      image: fortune_teller_2,
      name: "อาจารย์แดง",
      rank: 3,
      color: "#AC7F5E",
    },
  ];
  const articles = [
    { slug: "six-top-astro", image: article_1, title: "6 ศาสตร์ดูดวงยอดนิยม", author: "อาจารย์ไม้ร่ม" },
    { slug: "how-to-tarot", image: article_2, title: "How to เปิดไพ่ทาโรต์", author: "อาจารย์แดง" },
    { slug: "4-signs-promo", image: article_3, title: "4 ราศีได้เลื่อนขั้น", author: "หมอบี" },
    { slug: "4-signs-promo-extended", image: article_3, title: "4 ราศีได้เลื่อนขั้น ...", author: "หมอบี" },
    { slug: "august-topup-promo", image: home_new_01, title: "โปรโมชั่นเดือน สิงหาคม", author: "Horahub" },
    { slug: "why-people-like-horoscope", image: home_new_02, title: "ทำไมใครๆ ก็ชอบดูดวง ...", author: "Horahub" },
    { slug: "september-horoscope", image: home_new_03, title: "ดวงรายเดือนกันยายน ...", author: "Horahub" },
  ];
  const newsToArticle = [articles[4], articles[5], articles[6]];

  return (
    <ScreenWrapper>
      <ScrollView
        className="mb-8"
      >
        <HomeNews
          images={images}
          height={240}
          dotActiveClass="bg-accent-200"
          dotClass="bg-alabaster"
          onIndexChange={(i) => { }}
          // NEW: handle image press by index (see step 3 for HomeNews change)
          onImagePress={(i) => {
            const uri = Asset.fromModule(a.image).uri;
            const a = newsToArticle[i % newsToArticle.length];
            router.push({
              pathname: "/article/[slug]",
              params: { slug: a.slug,image: a.image, title: a.title, author: a.author }
            });
          }}
        />

        <View className="px-4 py-4">

          {/* Fortune teller recommendation */}
          <View className="flex-row items-center gap-2.5">
            <Text className="text-white text-base font-semibold w-32">หมอดูออนไลน์</Text>
            <View className="bg-secondary-100 rounded-md w-20 my-3 px-1">
              <Text className="text-base text-white text-center py-2">ดูทั้งหมด</Text>
            </View>
          </View>
          <FortuneCarousel items={fortuneTellers} />

          {/* Fortune teller ranking */}
          <View className="flex-row items-center gap-2.5 mt-4">
            <Text className="text-white text-l font-semibold">อันดับหมอดู</Text>
            <View className="bg-secondary-100 rounded-md w-20 my-3 px-1">
              <Text className="text-l text-white text-center py-2">ดูทั้งหมด</Text>
            </View>
          </View>
          <RankingPodium background={ranking_bg} items={podiumItems} />

          {/* Article list */}
          {/* Article list */}
          <View className="gap-2.5 mt-8">
            <Text className="text-white text-l font-semibold">บทความ</Text>
            <ArticleCarousel
              items={articles.map(a => ({
                image: a.image,
                title: a.title,
                author: a.author,
                onPress: () => router.push({
                  pathname: "/article/[slug]",
                  params: { slug: a.slug,image: a.image, title: a.title, author: a.author }
                }),
              }))}
            />
          </View>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}