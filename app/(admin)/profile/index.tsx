import ScreenWrapper from "@/app/components/ScreenWrapper";
import HistoryCardList from "@/app/components/profile/HistoryCardList";
import fortune_teller_1 from "@/assets/images/home/fortune_teller_1.png";
import fortune_teller_2 from "@/assets/images/home/fortune_teller_2.png";
import fortune_teller_3 from "@/assets/images/home/fortune_teller_3.png";
import profile_background from '@/assets/images/profile_background.png';
import { MaterialIcons } from '@expo/vector-icons';
import {
    GoogleSignin
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import HeaderBar from "../../components/ui/HeaderBar";

export default function ProfilePage() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const getBaseURL = () => {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3456";
    }
    return "http://localhost:3456";
  };

  const googleSignOut = async () => {
    try {
      // 1) Sign out from Google SDK
      await GoogleSignin.signOut();

      // 2) Optional but recommended if you want to force account re-pick next time
      // (removes granted scopes on Google side)
      try { await GoogleSignin.revokeAccess(); } catch { }

      // 3) Remove your backend token
      await SecureStore.deleteItemAsync('access_token');

      // 4) Clear local UI state and go to login
      setUserInfo(null);
      setOpen(false);
      router.replace('/(tabs)/profile'); // or your auth screen, e.g. '/(auth)/login'
    } catch (e) {
      console.error('Sign out error', e);
      Alert.alert('Sign out failed', 'Please try again.');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. Get token from SecureStore
        const token = await SecureStore.getItemAsync('access_token');
        if (!token) {
          console.log('No access token found');
          setUserInfo(null);
          return;
        }

        // 2. Fetch profile from backend
        const res = await axios.get(`${getBaseURL()}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 3. Set user info
        setUserInfo(res.data);
        console.log('Fetched profile:', res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);
  const historyData = [
    {
      fortuneTellerName: "อาจารย์ไม้ร่ม",
      status: "จองคิวแล้ว",
      profileImage: fortune_teller_3,
      horoscopeType: "ดูดวงลายมือ",
      dateTime: "วันที่ 11 ก.ย. 68 เวลา 13.00-13.20",
      price: "120 บาท",
    },
    {
      fortuneTellerName: "หมอบี",
      status: "สำเร็จ",
      profileImage: fortune_teller_1,
      horoscopeType: "ดูดวงความรัก",
      dateTime: "วันที่ 15 ส.ค. 68 เวลา 14.20-14.35",
      price: "600 บาท",
    },
    {
      fortuneTellerName: "อาจารย์แดง",
      status: "ยกเลิก",
      profileImage: fortune_teller_2,
      horoscopeType: "ดูดวงวันเกิด",
      dateTime: "วันที่ 10 ส.ค. 68 เวลา 10.10-10.40",
      price: "321 บาท",
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-200">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white font-sans-semibold mt-2.5">Loading…</Text>
      </View>
    );
  }

  
  return (
    <ScreenWrapper>
      {userInfo ? (
      <View>
            <ScrollView className="mb-20" bounces={false} overScrollMode="never">
              <HeaderBar title="Admin"/>
              <View className='relative h-64'>
                <Image
                  source={profile_background}
                  style={{ width: '100%', height: 150, resizeMode: 'cover' }}
                />
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
                  <Text
                    className='text-white font-sans-semibold text-2xl max-w-[256px]'
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {userInfo.FirstName} {userInfo.LastName}
                  </Text>

                </View>
              </View>

              <View className='mx-4 my-5 flex-col gap-6'>
                <Text className='text-white text-xl font-sans-medium' numberOfLines={1} ellipsizeMode="tail">อีเมล : {userInfo.Email}</Text>
                <Text className='text-white text-xl font-sans-medium' >Bio : ขอการันตีความแม่นยำ ในการพยากรณ์ ทุกศาสตร์ ไม่ว่าจะเป็น ไพ่ยิปซี เลข 7 ตัว 9 ฐาน หรือ โหราศาสตร์ไทย ได้รับการรับรอง</Text>
                <Text className='text-white text-xl font-sans-bold'>ประวัติการใช้งาน :</Text>
                <HistoryCardList items={historyData} />
              </View>
            </ScrollView>
            <Modal
              visible={open}
              transparent
              animationType="fade"
              onRequestClose={() => setOpen(false)}
            >
              {/* Dimmed backdrop */}
              <Pressable
                onPress={() => setOpen(false)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Stop backdrop tap from closing when pressing content */}
                <Pressable
                  onPress={() => { }}
                  className="bg-primary-200"
                  style={{
                    width: '85%',
                    borderRadius: 16,
                    padding: 16,
                    gap: 12
                  }}
                >
                  <View className="flex flex-row w-full justify-center relative  p-2">
                    <Text className="text-white font-sans-semibold text-xl">การตั้งค่าบัญชี</Text>
                    <Pressable
                      onPress={() => setOpen(false)}
                      className="absolute right-0 top-0 p-2"
                    >
                      <MaterialIcons name="close" size={24} color="white" />
                    </Pressable>
                  </View>

                  {/* Your settings actions */}
                  <Pressable onPress={() => { 
                    router.push("/profile/edit-profile");
                    setOpen(false);}}
                    className="flex flex-row justify-between gap-2 bg-primary-100 w-full h-12 rounded-lg p-2.5">
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
          <View>

          </View>
        )}
    </ScreenWrapper>
  );
}
