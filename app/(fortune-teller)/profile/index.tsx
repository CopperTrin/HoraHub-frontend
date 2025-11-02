
import ScreenWrapper from "@/app/components/ScreenWrapper";
import HistoryCardList from "@/app/components/profile/HistoryCardList";
import profile_background from '@/assets/images/profile_background.png';
import { MaterialIcons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import HeaderBar from "../../components/ui/HeaderBar";

type WalletMe = {
  AccountingID: string;
  Balance_Number: number;
  Label: string;
  UserID: string;
};

type TimeSlotItem = {
  TimeSlotID: string;
  StartTime: string;
  EndTime: string;
  LockAmount: number;
  Status: "BOOKED" | "COMPLETED" | "CANCEL" | "AVAILABLE" | string;
  FortuneTellerID: string;
  ServiceID: string;
};

type ServiceDetail = {
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
    Bio?: string;
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

const getBaseURL = () => "https://softdev-horahub-backend-production.up.railway.app";


const toThaiStatus = (s?: string): "จองคิวแล้ว" | "สำเร็จ" | "ยกเลิก" => {
  if (s === "COMPLETED") return "สำเร็จ";
  if (s === "CANCEL") return "ยกเลิก";
  if (s === "BOOKED") return "จองคิวแล้ว";
  return "จองคิวแล้ว";
};

const toThaiDate = (iso?: string | null) => {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleDateString("th-TH", { dateStyle: "medium" }); }
  catch { return "-"; }
};
const toThaiTime = (iso?: string | null) => {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }); }
  catch { return "-"; }
};

const formatTHB = (num?: number | null) => {
  if (typeof num !== "number") return "—";
  try {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num);
  } catch {
    return `${num.toLocaleString('th-TH')} บาท`;
  }
};

export default function ProfilePage() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<any>(null);
  const [fortuneTeller, setFortuneTeller] = useState<any>(null);

  const [wallet, setWallet] = useState<WalletMe | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [historyItems, setHistoryItems] = useState<
    {
      fortuneTellerName: string;
      status: "จองคิวแล้ว" | "สำเร็จ" | "ยกเลิก";
      profileImage: any;
      horoscopeType: string;
      dateTime: string;
      endTimeText: string;
      price: string;
    }[]
  >([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string>("");

  /** ===== Auth actions ===== */
  const googleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      try { await GoogleSignin.revokeAccess(); } catch { }
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('user_role');
      await SecureStore.deleteItemAsync('last_id_token');
      setUserInfo(null);
      setOpen(false);
      router.replace('/(tabs)/profile');
    } catch (e) {
      console.error('Sign out error', e);
      Alert.alert('Sign out failed', 'Please try again.');
    }
  };

  /** ===== Fetchers ===== */
  const fetchProfile = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) { setUserInfo(null); return; }
      const res = await axios.get(`${getBaseURL()}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(res.data);
    } catch (error: any) {
      if (error?.response?.status === 401) { await googleSignOut(); }
      else { console.log('Error fetching profile:', error?.response?.data || error.message); }
    }
  }, []);

  const fetchFortuneTellerMe = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      const res = await axios.get(`${getBaseURL()}/fortune-teller/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFortuneTeller(res.data);
    } catch (error: any) {
      console.log('Error fetching fortune teller:', error?.response?.data || error.message);
    }
  }, []);

  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) { setWallet(null); setWalletLoading(false); return; }
      const res = await axios.get<WalletMe>(`${getBaseURL()}/accounting/fortune-teller/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallet(res.data);
    } catch (error: any) {
      console.log('Error fetching wallet:', error?.response?.data || error.message);
      setWallet(null);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const fetchTimeSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsError("");
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) { setHistoryItems([]); setSlotsLoading(false); return; }

      const res = await axios.get<TimeSlotItem[]>(
        `${getBaseURL()}/time-slots/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const slots = Array.isArray(res.data) ? res.data : [];

      const allowed = new Set(["BOOKED", "COMPLETED", "CANCEL"]);
      const filtered = slots.filter(s => allowed.has(String(s.Status)));

      const enriched = await Promise.all(
        filtered.map(async (ts) => {
          try {
            const resService = await axios.get<ServiceDetail>(`${getBaseURL()}/services/${ts.ServiceID}`);
            const service = resService.data;
            let ftUser: UserDetail | null = null;
            const ftUserId = service?.FortuneTeller?.UserID || null;
            if (ftUserId) {
              try {
                const resUser = await axios.get<UserDetail>(`${getBaseURL()}/users/${ftUserId}`);
                ftUser = resUser.data;
              } catch { }
            }

            const profileURL =
              ftUser?.UserInfo?.PictureURL ||
              service?.ImageURLs?.[0] ||
              "https://cdn-icons-png.flaticon.com/512/1077/1077012.png";

            const realName = [ftUser?.UserInfo?.FirstName, ftUser?.UserInfo?.LastName]
              .filter(Boolean).join(" ").trim();
            const fortuneTellerName = realName || ftUser?.Username || "ไม่ระบุชื่อ";

            const serviceName = service?.Service_name || "บริการดูดวง";

            const dateTime = `${toThaiDate(ts.StartTime)} • ${toThaiTime(ts.StartTime)} น.`;
            const endTimeText = ts.EndTime ? `สิ้นสุด ${toThaiTime(ts.EndTime)} น.` : "สิ้นสุด —";

            const priceNumber = typeof service?.Price === "number" ? service.Price : null;

            return {
              fortuneTellerName,
              status: toThaiStatus(ts.Status),
              profileImage: { uri: profileURL },
              horoscopeType: serviceName,
              dateTime,
              endTimeText,
              price: typeof priceNumber === "number" ? `${priceNumber} บาท` : "-",
            };
          } catch {
            const dateTime = `${toThaiDate(ts.StartTime)} • ${toThaiTime(ts.StartTime)} น.`;
            const endTimeText = ts.EndTime ? `สิ้นสุด ${toThaiTime(ts.EndTime)} น.` : "สิ้นสุด —";
            return {
              fortuneTellerName: "ไม่ระบุชื่อ",
              status: toThaiStatus(ts.Status),
              profileImage: { uri: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png" },
              horoscopeType: "บริการดูดวง",
              dateTime,
              endTimeText,
              price: "-",
            };
          }
        })
      );

      setHistoryItems(enriched);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        await googleSignOut();
      } else {
        console.error("Error loading /time-slots/me:", error?.response?.data || error);
        setSlotsError("ไม่สามารถโหลดประวัติการใช้งานได้");
      }
      setHistoryItems([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  /** ===== Lifecycle ===== */
  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        await Promise.all([fetchProfile(), fetchFortuneTellerMe(), fetchWallet(), fetchTimeSlots()]);
        setLoading(false);
      })();
    }, [fetchProfile, fetchFortuneTellerMe, fetchWallet, fetchTimeSlots])
  );

  /** ===== UI ===== */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-200">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white font-sans-semibold mt-2.5">กำลังโหลด…</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      {userInfo ? (
        <View>
          <ScrollView className="mb-20" bounces={false} overScrollMode="never">
            <HeaderBar title="Fortune Teller" showChat />
            <View className='relative h-64'>
              <Image source={profile_background} style={{ width: '100%', height: 150, resizeMode: 'cover' }} />
              <Pressable
                onPress={() => setOpen(true)}
                style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                android_ripple={{ color: '#00000022', borderless: true }}
                className="self-end mr-4 mt-4"
              >
                <MaterialIcons name="settings" size={28} color="white" />
              </Pressable>

              <View className='absolute left-7 top-12'>
                <Image
                  source={{ uri: userInfo.PictureURL }}
                  style={{ width: 129, height: 128, borderRadius: 64, marginVertical: 10 }}
                />
                <Text className='text-white font-sans-semibold text-2xl max-w-[256px]' numberOfLines={1}>
                  {userInfo.FirstName} {userInfo.LastName}
                </Text>
              </View>
            </View>

            <View className='mx-4 my-5 flex-col gap-6'>
              {/* Wallet Card */}
              <Pressable onPress={() => router.push("/wallet-fortune-teller")} className="bg-accent-200 rounded-2xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="account-balance-wallet" size={24} color="black" />
                    <Text className="text-blackpearl font-sans-semibold text-xl">กระเป๋าเงิน</Text>
                  </View>
                  {walletLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-blackpearl font-sans-bold text-2xl">
                      {formatTHB(wallet?.Balance_Number ?? null)}
                    </Text>
                  )}
                </View>
              </Pressable>

              <Text className='text-white text-xl font-sans-medium' numberOfLines={1}>
                อีเมล : {userInfo.Email}
              </Text>

              <Text className='text-white text-xl font-sans-medium'>
                Bio : {fortuneTeller?.Bio ? fortuneTeller.Bio : '—'}
              </Text>
              <Text className="text-white text-xl font-sans-medium">
                คะแนนสะสม: {fortuneTeller.Point?.toFixed(2)} คะแนน
              </Text>

              <Text className='text-white text-xl font-sans-bold'>ประวัติการใช้งาน :</Text>

              {slotsLoading ? (
                <View className="mt-2 flex-row items-center gap-2">
                  <ActivityIndicator />
                  <Text className="text-white font-sans">กำลังโหลดประวัติ…</Text>
                </View>
              ) : slotsError ? (
                <Text className="text-red-300 font-sans">{slotsError}</Text>
              ) : historyItems.length === 0 ? (
                <Text className="text-white/80 font-sans">ยังไม่มีประวัติการใช้งาน</Text>
              ) : (
                <HistoryCardList items={historyItems} />
              )}
            </View>
          </ScrollView>

          {/* Settings Modal */}
          <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
            <Pressable
              onPress={() => setOpen(false)}
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Pressable onPress={() => { }} className="bg-primary-200" style={{ width: '85%', borderRadius: 16, padding: 16, gap: 12 }}>
                <View className="flex flex-row w-full justify-center relative  p-2">
                  <Text className="text-white font-sans-semibold text-xl">การตั้งค่าบัญชี</Text>
                  <Pressable onPress={() => setOpen(false)} className="absolute right-0 top-0 p-2">
                    <MaterialIcons name="close" size={24} color="white" />
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => { router.push("/(fortune-teller)/profile/edit-profile-fortune-teller"); setOpen(false); }}
                  className="flex flex-row justify-between gap-2 bg-primary-100 w-full h-12 rounded-lg p-2.5"
                >
                  <Text className="text-white font-sans-semibold text-xl">แก้ไขโปรไฟล์</Text>
                  <MaterialIcons name="arrow-forward-ios" size={24} color="white" />
                </Pressable>

                <Pressable onPress={googleSignOut} className="flex flex-row justify-center gap-2 bg-accent-200 w-full h-12 rounded-lg p-2.5 mt-24">
                  <Text className="text-blackpearl font-sans-semibold text-xl self-center">ออกจากระบบ</Text>
                  <MaterialIcons name="logout" size={24} color="black" />
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      ) : (
        <View />
      )}
    </ScreenWrapper>
  );
}
