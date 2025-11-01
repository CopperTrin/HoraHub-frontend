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
import home_new_01 from "@/assets/images/home/home_new_01.png";
import home_new_02 from "@/assets/images/home/home_new_02.jpg";
import home_new_03 from "@/assets/images/home/home_new_03.jpg";
import ranking_bg from "@/assets/images/home/ranking_bg.png";

import axios from "axios";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

/** ===== Utils ===== */
const getBaseURL = () =>
  Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";

/** ===== Types ===== */
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

type ServiceItem = {
  ServiceID: string;
  Service_name: string;
  Service_Description?: string;
  Price?: number | null;
  Avg_Rating?: number | null;
  ImageURLs?: string[];
  CategoryID?: string;
  FortuneTellerID: string;
  FortuneTeller?: {
    FortuneTellerID: string;
    UserID: string;
    Status: string;
    CVURL?: string;
    Point?: number;
    Bio?: string | null;
  };
  Category?: {
    CategoryID: string;
    Category_name: string;
    Category_Description?: string;
    Category_type?: string;
  };
};

type UserDetail = {
  UserID: string;
  Username?: string;
  Role?: string[];
  UserInfo?: {
    FirstName?: string;
    LastName?: string;
    PictureURL?: string;
    Email?: string;
    GoogleID?: string;
  };
};

type FtItem = { image?: any; label: string; onPress: () => void };

export default function HomePage() {
  /** ---------- News banner images ---------- */
  const images = [home_new_03, home_new_02, home_new_01];

  /** ---------- Fortune tellers (recommendation) ---------- */
  const [ftItems, setFtItems] = useState<FtItem[]>([]);
  const [loadingFT, setLoadingFT] = useState<boolean>(true);

  // Build display name from /users response
  const getDisplayNameFromUser = (u?: UserDetail | null) => {
    const fn = u?.UserInfo?.FirstName?.trim() || "";
    const ln = u?.UserInfo?.LastName?.trim() || "";
    const fullname = [fn, ln].filter(Boolean).join(" ").trim();
    return fullname || u?.Username || "ไม่ระบุชื่อ";
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingFT(true);
      try {
        // 1) ดึงบริการทั้งหมด
        const res = await axios.get<ServiceItem[]>(`${getBaseURL()}/services`);
        const services = Array.isArray(res.data) ? res.data : [];

        // 2) รวมเป็นราย “หมอดู” (เลือกบริการที่มี Avg_Rating สูงสุดเป็นตัวแทน)
        const byFT = new Map<
          string,
          { best: ServiceItem; rating: number | null }
        >();

        for (const s of services) {
          const ftId = s?.FortuneTeller?.FortuneTellerID || s.FortuneTellerID;
          console.log("Service for FT:", ftId, s.Service_name, s.Avg_Rating);
          if (!ftId) continue;
          const rating = typeof s.Avg_Rating === "number" ? s.Avg_Rating : null;

          if (!byFT.has(ftId)) {
            byFT.set(ftId, { best: s, rating });
          } else {
            const curr = byFT.get(ftId)!;
            const currRating = curr.rating ?? -Infinity;
            const newRating = rating ?? -Infinity;
            if (newRating > currRating) {
              byFT.set(ftId, { best: s, rating });
            }
          }
        }

        const perFT = Array.from(byFT.values());

        // 3) เลือก 10 คน ตามกติกา
        const hasAnyRating = perFT.some((x) => x.rating !== null);
        const selected = (hasAnyRating
          ? perFT
            .sort((a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity))
            .slice(0, 10)
          : perFT.slice(0, 10)
        ).map((x) => x.best);

        // 4) ดึงข้อมูล user ของหมอดูเพื่อเอา “ชื่อ-รูปจริง”
        const userLookups = await Promise.allSettled(
          selected.map((svc) => {
            const userId = svc?.FortuneTeller?.UserID;
            return userId
              ? axios.get<UserDetail>(`${getBaseURL()}/users/${userId}`)
              : Promise.resolve({ data: null } as any);
          })
        );

        const items: FtItem[] = selected.map((svc, idx) => {
          const ftId =
            svc?.FortuneTeller?.FortuneTellerID || svc.FortuneTellerID || "unknown";
          const u =
            userLookups[idx].status === "fulfilled" ? userLookups[idx].value?.data : null;

          const label = getDisplayNameFromUser(u);
          const picture = u?.UserInfo?.PictureURL || svc.ImageURLs?.[0];

          return {
            image: picture ? { uri: picture } : undefined,
            label,
            onPress: () => {
              router.push(`/fortune_teller_profile/${ftId}`);
            },
          };
        });

        if (!mounted) return;
        setFtItems(items);
      } catch (e) {
        console.log("Load services (recommendation) error:", e);
        if (!mounted) return;
        setFtItems([]);
      } finally {
        if (mounted) setLoadingFT(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /** ---------- Leaderboards (0..N) ---------- */
  const [boards, setBoards] = useState<LeaderboardSummary[]>([]);
  const [boardPodiums, setBoardPodiums] = useState<Record<string, PodiumItem[]>>({});
  const [loadingBoards, setLoadingBoards] = useState<boolean>(true);

  const colors = useMemo(
    () => ({
      gold: "#FFD824",
      silver: "#C7C7C7",
      bronze: "#AC7F5E",
    }),
    []
  );
  const rankColors: Record<number, string> = { 1: colors.gold, 2: colors.silver, 3: colors.bronze };

  const buildTop3 = (list: any[]): PodiumItem[] => {
    const top3 = list.slice(0, 3).map((x: any, idx: number) => {
      const ft = x?.FortuneTeller;
      const rank = (idx + 1) as 1 | 2 | 3;
      const picture = ft?.User?.UserInfo?.PictureURL;
      return {
        image: picture ? { uri: picture } : undefined,
        name: (() => {
          const ui = ft?.User?.UserInfo;
          const fullname = [ui?.FirstName, ui?.LastName].filter(Boolean).join(" ").trim();
          return fullname || ft?.User?.Username || "ไม่ระบุชื่อ";
        })(),
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
            const list = (res.value?.data?.FortuneTellers ?? []) as any[];
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

  /** ---------- Mock articles (unchanged) ---------- */
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

  /** ---------- UI ---------- */
  return (
    <ScreenWrapper>
      <ScrollView className="mb-0">
        <HeaderBar title="Home" showChat />

        {/* News slider */}
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

            <Pressable onPress={() => router.push("/(tabs)/p2p")}>
              <View className="bg-secondary-100 rounded-md w-20 my-3 px-1">
                <Text className="text-base text-white text-center py-2 font-sans-medium">
                  ดูทั้งหมด
                </Text>
              </View>
            </Pressable>
          </View>

          {loadingFT ? (
            <View className="py-2">
              <Text className="text-white/80 font-sans">กำลังโหลดหมอดูแนะนำ…</Text>
            </View>
          ) : ftItems.length === 0 ? (
            <View className="py-2">
              <Text className="text-white/80 font-sans">ยังไม่มีหมอดูสำหรับแนะนำ</Text>
            </View>
          ) : (

            <FortuneCarousel items={ftItems} />
          )}

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
                          router.push("/(tabs)/p2p");
                          setTimeout(() => {
                            router.push({
                              pathname: "/(tabs)/p2p/podium",
                              params: { id: b.LeaderboardID },
                            });
                          }, 10);
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