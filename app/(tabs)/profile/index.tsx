import HistoryCardList from "@/app/components/profile/HistoryCardList";
import ScreenWrapper from '@/app/components/ScreenWrapper';
import fortune_teller_1 from "@/assets/images/home/fortune_teller_1.png";
import fortune_teller_2 from "@/assets/images/home/fortune_teller_2.png";
import fortune_teller_3 from "@/assets/images/home/fortune_teller_3.png";
import horahub_logo from '@/assets/images/horahub.png';
import profile_background from '@/assets/images/profile_background.png';
import { MaterialIcons } from '@expo/vector-icons';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const getBaseURL = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3456";
  }
  return "http://localhost:3456";
};

GoogleSignin.configure({
  webClientId: "797950834704-ld6utko8v934u4666gntlao07basljus.apps.googleusercontent.com", // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  // scopes: [
  //   /* what APIs you want to access on behalf of the user, default is email and profile
  //   this is just an example, most likely you don't need this option at all! */
  //   'https://www.googleapis.com/auth/drive.readonly',
  // ],
  // offlineAccess: false, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  // hostedDomain: '', // specifies a hosted domain restriction
  // forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  // accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId: "797950834704-k6hgh7919oige4r5tmv6qbl1qg6s69o4.apps.googleusercontent.com", // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  // googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
  // openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  // profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

export default function HomeScreen() {

  const router = useRouter();

  const [userInfo, setUserInfo] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const handleGoogleSignIn = async (role: 'CUSTOMER' | 'FORTUNE_TELLER') => {
    try {
      console.log("Sign in");
      await GoogleSignin.hasPlayServices();
      console.log("hasPlayServices");
      const response = await GoogleSignin.signIn();
      console.log("GoogleSignin.signIn response:");
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log(response.data);
        //setUserInfo(response.data);
        const res = await axios.post(`${getBaseURL()}/auth/google/mobile`, {
          idToken,
          role, // or FORTUNE_TELLER
        });
        const token = res.data.access_token;
        // Save token with SecureStore / AsyncStorage
        await SecureStore.setItemAsync("access_token", token);
        console.log('Server response:', res.data);
        const profile = await axios.get(`${getBaseURL()}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserInfo(profile.data);
        // Navigate to the protected route
        //router.push('/(tabs)/home');
      } else {
        console.log('Sign in cancelled or some other issue');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            Alert.alert('Sign in is in progress already');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            Alert.alert('Play services not available or outdated');
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
        Alert.alert('An unknown error occurred during Google sign in');
        console.error(error);
      }
    }
  }

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
      //router.replace('/'); // or your auth screen, e.g. '/(auth)/login'
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

  return (
    <ScreenWrapper>
      <View>
        {userInfo ? (
          <View>
            <ScrollView className="mb-20" bounces={false} overScrollMode="never">
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
              <TouchableOpacity
                onPress={() => router.push("/(fortune-teller)/dashboard")}
                className="bg-accent-200 px-6 py-3 rounded-full"
              >
                <Text className="text-black text-lg font-bold">
                  ไปหน้า Fortune Teller
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <Modal
              visible={open}
              transparent
              animationType="fade"    // or "slide"
              onRequestClose={() => setOpen(false)} // Android back button
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
                  <Pressable onPress={() => { /* navigate / toggle */ }} className="flex flex-row justify-between gap-2 bg-primary-100 w-full h-12 rounded-lg p-2.5">
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
          <View className='flex justify-center items-center w-full h-full gap-8'>
            <View className='flex justify-center items-center'>
              <Image
                source={horahub_logo}
                className='w-28 h-28 mb-8'
              />
              <Text className='text-white font-sans-semibold text-3xl'>ยินดีต้อนรับสู่ Horahub</Text>
              <Text className='text-white font-sans-semibold text-xl'>เข้าสู่ระบบด้วยบัญชีของคุณ</Text>
            </View>

            <TouchableOpacity
              className="bg-accent-200 px-6 py-3 rounded-lg w-96 h-16 flex justify-center items-center"
              onPress={() => handleGoogleSignIn('CUSTOMER')}
            >
              <Text className="text-blackpearl text-xl font-sans-semibold">เข้าสู่ระบบด้วย Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-accent-200 px-6 py-3 rounded-lg w-96 h-16 flex justify-center items-center  mb-32"
              onPress={() => handleGoogleSignIn('FORTUNE_TELLER')}
            >
              <Text className="text-blackpearl text-xl font-sans-semibold">เข้าสู่ระบบด้วย Fortune teller</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
