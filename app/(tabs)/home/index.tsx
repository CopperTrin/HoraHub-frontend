// app/(tabs)/home/index.tsx
import ArticleCarousel from "@/app/components/home/ArticleCarousel";
import FortuneCarousel from "@/app/components/home/FortuneCarousel";
import HomeNews from "@/app/components/home/HomeNews";
import RankingPodium from "@/app/components/home/RankingPodium";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeaderBar from "../../components/ui/HeaderBar";

import article_1 from "@/assets/images/home/article_1.png";
import article_2 from "@/assets/images/home/article_2.png";
import article_3 from "@/assets/images/home/article_3.jpg";
import fortune_teller_1 from "@/assets/images/home/fortune_teller_1.png";
import fortune_teller_2 from "@/assets/images/home/fortune_teller_2.png";
import fortune_teller_3 from "@/assets/images/home/fortune_teller_3.png";
import home_new_01 from "@/assets/images/home/home_new_01.png";
import home_new_02 from "@/assets/images/home/home_new_02.jpg";
import home_new_03 from "@/assets/images/home/home_new_03.jpg";
import ranking_bg from "@/assets/images/home/ranking_bg.png";

import axios from "axios";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

const getBaseURL = () =>
  Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";

type LeaderboardSummary = {
  LeaderboardID: string;
  Description: string;
  Prize_Pool?: number;
};

type PodiumItem = {
  image?: any;
  name: string;
  rank: 1 | 2 | 3;
  color: string;
};

export default function HomePage() {
  const images = [home_new_03, home_new_02, home_new_01];

  const fortuneTellers = [
    { image: fortune_teller_1, label: "หมอบี" },
    { image: fortune_teller_2, label: "อาจารย์แดง" },
    { image: fortune_teller_3, label: "อาจารย์ไม้ร่ม" },
    { image: fortune_teller_1, label: "แพรร์รี่" },
    { image: fortune_teller_1, label: "หมอบี" },
    { image: fortune_teller_2, label: "อาจารย์แดง" },
    { image: fortune_teller_3, label: "อาจารย์ไม้ร่ม" },
    { image: fortune_teller_1, label: "แพรร์รี่" },
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

  const colors = useMemo(
    () => ({
      gold: "#FFD824",
      silver: "#C7C7C7",
      bronze: "#AC7F5E",
    }),
    []
  );
  const rankColors: Record<number, string> = { 1: colors.gold, 2: colors.silver, 3: colors.bronze };

  const getDisplayName = (ft: any) => {
    const ui = ft?.User?.UserInfo;
    const fullname = [ui?.FirstName, ui?.LastName].filter(Boolean).join(" ").trim();
    return fullname || ft?.User?.Username || "ไม่ระบุชื่อ";
  };

  const [boards, setBoards] = useState<LeaderboardSummary[]>([]);
  const [boardPodiums, setBoardPodiums] = useState<Record<string, PodiumItem[]>>({});
  const [loadingBoards, setLoadingBoards] = useState<boolean>(true);

  const buildTop3 = (list: any[]): PodiumItem[] => {
    const top3 = list.slice(0, 3).map((x: any, idx: number) => {
      const ft = x?.FortuneTeller;
      const rank = (idx + 1) as 1 | 2 | 3;
      const picture = ft?.User?.UserInfo?.PictureURL;
      return {
        image: picture ? { uri: picture } : undefined,
        name: getDisplayName(ft),
        rank,
        color: rankColors[rank],
      };
    });

    const padded = [...top3];
    for (let i = top3.length; i < 3; i++) {
      const rank = (i + 1) as 1 | 2 | 3;
      padded.push({
        image: undefined,
        name: "รอจัดอันดับ",
        rank,
        color: rankColors[rank],
      });
    }
    return padded;
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingBoards(true);
      try {
        const lbRes = await axios.get(`${getBaseURL()}/leaderboards`);
        const allBoards: LeaderboardSummary[] = Array.isArray(lbRes.data) ? lbRes.data : [];
        if (!mounted) return;

        setBoards(allBoards);

        if (allBoards.length === 0) {
          setBoardPodiums({});
          return;
        }

        const details = await Promise.allSettled(
          allBoards.map((b) =>
            axios.get(`${getBaseURL()}/leaderboards/${b.LeaderboardID}?page=1&limit=3`)
          )
        );

        if (!mounted) return;

        const podiumMap: Record<string, PodiumItem[]> = {};
        details.forEach((res, idx) => {
          const b = allBoards[idx];
          if (res.status === "fulfilled") {
            const list = res.value?.data?.FortuneTellers ?? [];
            podiumMap[b.LeaderboardID] = buildTop3(list);
          } else {
            podiumMap[b.LeaderboardID] = buildTop3([]);
            console.log("Load ranking error (board):", b.LeaderboardID, res.reason);
          }
        });

        setBoardPodiums(podiumMap);
      } catch (e) {
        console.log("Load leaderboards error:", e);
        if (!mounted) return;
        setBoards([]);
        setBoardPodiums({});
      } finally {
        if (mounted) setLoadingBoards(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [colors]);

  return (
    <ScreenWrapper>
      <ScrollView className="mb-0">
        <HeaderBar title="Home" showChat />
        <HomeNews
          images={images}
          height={240}
          dotActiveClass="bg-accent-200"
          dotClass="bg-alabaster"
          onIndexChange={() => { }}
          onImagePress={(i) => {
            const a = newsToArticle[i % newsToArticle.length];
            router.push({
              pathname: "/article/[slug]",
              params: { slug: a.slug, image: a.image, title: a.title, author: a.author },
            });
          }}
        />

        <View className="px-4 py-4">
          {/* Fortune teller recommendation */}
          <View className="flex-row items-center gap-2.5">
            <Text className="text-white text-base font-sans-semibold">หมอดูออนไลน์</Text>
            <View className="bg-secondary-100 rounded-md w-20 my-3 px-1" >
              <Text className="text-base text-white text-center py-2 font-sans-medium">
                ดูทั้งหมด
              </Text>
            </View>
          </View>
          <FortuneCarousel items={fortuneTellers} />

          {/* --- Leaderboards (0..N) --- */}
          <View className="mt-4">
            {loadingBoards ? (
              <View className="py-3">
                <Text className="text-white/80 font-sans">กำลังโหลดอันดับ...</Text>
              </View>
            ) : boards.length === 0 ? (
              <View className="py-3">
                <Text className="text-white/80 font-sans">
                  ยังไม่มีการจัดอันดับในขณะนี้
                </Text>
              </View>
            ) : (
              boards.map((b) => {
                const items = boardPodiums[b.LeaderboardID];
                const isLoadingThis = !items || items.length === 0;
                return (
                  <View key={b.LeaderboardID} className="mb-6">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-1 pr-3">
                        <Text className="text-white text-l font-sans-semibold">
                          อันดับหมอดู — {b.Description}
                        </Text>
                        {!!b.Prize_Pool && (
                          <Text className="text-white/80 font-sans text-sm">
                            Prize Pool: {b.Prize_Pool.toLocaleString()} Coins
                          </Text>
                        )}
                      </View>
                      <Pressable
                        className="bg-secondary-100 rounded-md w-20 px-1"
                        onPress={() => {
                          router.push({
                            pathname: "/(tabs)/p2p/podium",
                            params: { id: b.LeaderboardID },
                          });
                        }}
                      >
                        <Text className="text-l text-white text-center py-2 font-sans">
                          ดูทั้งหมด
                        </Text>
                      </Pressable>
                    </View>

                    <RankingPodium
                      background={ranking_bg}
                      items={items || []}
                      loading={isLoadingThis}
                    />
                  </View>
                );
              })
            )}
          </View>

          {/* Article list */}
          <View className="gap-2.5 mt-2 mb-8">
            <Text className="text-white text-l font-sans-semibold">บทความ</Text>
            <ArticleCarousel
              items={articles.map((a) => ({
                image: a.image,
                title: a.title,
                author: a.author,
                onPress: () =>
                  router.push({
                    pathname: "/article/[slug]",
                    params: { slug: a.slug, image: a.image, title: a.title, author: a.author },
                  }),
              }))}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
