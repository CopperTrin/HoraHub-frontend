// index.tsx
import HistoryCardList from "@/app/components/profile/HistoryCardList";
import ScreenWrapper from '@/app/components/ScreenWrapper';
import fortune_teller_1 from "@/assets/images/home/fortune_teller_1.png";
import fortune_teller_2 from "@/assets/images/home/fortune_teller_2.png";
import fortune_teller_3 from "@/assets/images/home/fortune_teller_3.png";
import horahub_logo from '@/assets/images/horahub.png';
import profile_background from '@/assets/images/profile_background.png';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const getBaseURL = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3456";
  }
  return "http://localhost:3456";
};

GoogleSignin.configure({
  webClientId: "797950834704-ld6utko8v934u4666gntlao07basljus.apps.googleusercontent.com",
  iosClientId: "797950834704-k6hgh7919oige4r5tmv6qbl1qg6s69o4.apps.googleusercontent.com",
});

export default function HomeScreen() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<any>(null);

  // --- NEW: upload states ---
  const [uploadKey, setUploadKey] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const withAuth = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    if (!token) throw new Error("No access token");
    return { Authorization: `Bearer ${token}` };
  };

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

        const res = await axios.post(`${getBaseURL()}/auth/google/mobile`, {
          idToken,
          role,
        });
        const token = res.data.access_token;
        await SecureStore.setItemAsync("access_token", token);
        console.log('Server response:', res.data);

        const profile = await axios.get(`${getBaseURL()}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserInfo(profile.data);
      } else {
        console.log('Sign in cancelled or some other issue');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert('Sign in is in progress already');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Play services not available or outdated');
            break;
          default:
        }
      } else {
        Alert.alert('An unknown error occurred during Google sign in');
        console.error(error);
      }
    }
  }

  const googleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      try { await GoogleSignin.revokeAccess(); } catch {}
      await SecureStore.deleteItemAsync('access_token');
      setUserInfo(null);
      setUploadKey(null);
      setImgUrl(null);
    } catch (e) {
      console.error('Sign out error', e);
      Alert.alert('Sign out failed', 'Please try again.');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (!token) {
          console.log('No access token found');
          setUserInfo(null);
          return;
        }

        const res = await axios.get(`${getBaseURL()}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserInfo(res.data);
        console.log('Fetched profile:', res.data);
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.warn("Access token expired or invalid. Logging out...");
          await SecureStore.deleteItemAsync("access_token");
          setUserInfo(null);
        } else {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, []);

  // --- NEW: pick image, upload, then get signed URL ---
  const pickAndUpload = async () => {
    try {
      setBusy(true);

      // 1) pick
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });
      if (res.canceled) return;

      const asset = res.assets[0];
      const uri = asset.uri;
      // prefer original filename if available; fall back to a generic name
      const baseName = asset.fileName ?? "upload";
      // preserve extension if present
      const ext = (baseName.includes(".") ? baseName.substring(baseName.lastIndexOf(".")) : ".png");
      const name = baseName.replace(/\s+/g, "_"); // avoid spaces in key
      const type = asset.mimeType ?? (ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png");

      // 2) upload with auth
      const headers = await withAuth();
      const form = new FormData();
      form.append("files", { uri, name, type } as any);

      const uploadResp = await axios.post(
        `${getBaseURL()}/s3/upload`,
        form,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const first = Array.isArray(uploadResp.data) ? uploadResp.data[0] : uploadResp.data;
      const key: string = first?.key;
      if (!key) throw new Error("Upload response missing key");
      setUploadKey(key);

      // 3) get presigned URL from server
      // Your GET endpoint expects just the filename (last segment of the key).
      const fileName = key.split("/").pop()!;
      const getResp = await axios.get(
        `${getBaseURL()}/s3/single/${encodeURIComponent(fileName)}`,
        { headers }
      );
      const signed = getResp.data?.url as string | undefined;
      if (!signed) throw new Error("Signed URL not returned");
      setImgUrl(signed);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        await SecureStore.deleteItemAsync("access_token");
        setUserInfo(null);
        Alert.alert("Session expired", "Please sign in again.");
      } else {
        Alert.alert("Upload error", err?.message ?? "Unknown error");
      }
    } finally {
      setBusy(false);
    }
  };

  // --- NEW: refresh presigned URL when it expires ---
  const refreshSignedUrl = async () => {
    if (!uploadKey) return;
    try {
      setBusy(true);
      const headers = await withAuth();
      const fileName = uploadKey.split("/").pop()!;
      const getResp = await axios.get(
        `${getBaseURL()}/s3/single/${encodeURIComponent(fileName)}`,
        { headers }
      );
      setImgUrl(getResp.data?.url);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        await SecureStore.deleteItemAsync("access_token");
        setUserInfo(null);
        Alert.alert("Session expired", "Please sign in again.");
      } else {
        Alert.alert("Fetch error", err?.message ?? "Unknown error");
      }
    } finally {
      setBusy(false);
    }
  };

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
      {/* make root fill the screen so ScrollView can scroll fully */}
      <View className="flex-1">
        {userInfo ? (
          <ScrollView
            className="mb-20"
            contentContainerStyle={{ paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
          >
            <View className='relative h-64'>
              <Image
                source={profile_background}
                style={{ width: '100%', height: 150, resizeMode: 'cover' }}
              />
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
              <Text className='text-white text-xl font-sans-medium'>Bio : ขอการันตีความแม่นยำ ในการพยากรณ์ ทุกศาสตร์ ไม่ว่าจะเป็น ไพ่ยิปซี เลข 7 ตัว 9 ฐาน หรือ โหราศาสตร์ไทย ได้รับการรับรอง</Text>

              {/* --- NEW: upload controls --- */}
              <View className="gap-3">
                <Button title="Pick & Upload Image" onPress={pickAndUpload} />
                {busy && <ActivityIndicator style={{ marginTop: 8 }} />}

                {uploadKey && (
                  <Text className="text-white" numberOfLines={1}>
                    key: {uploadKey}
                  </Text>
                )}

                {imgUrl && (
                  <>
                    <Image
                      source={{ uri: imgUrl }}
                      style={{ width: 240, height: 240, borderRadius: 12, marginTop: 12 }}
                      resizeMode="cover"
                    />
                    <View style={{ height: 8 }} />
                    <Button title="Refresh URL (if expired)" onPress={refreshSignedUrl} />
                  </>
                )}
              </View>

              <Text className='text-white text-xl font-sans-bold'>ประวัติการใช้งาน :</Text>
              <HistoryCardList items={historyData} />
            </View>

            <Button title="Sign Out" onPress={googleSignOut} />

            <TouchableOpacity
              onPress={() => router.push("/(fortune-teller)/dashboard")}
              className="bg-accent-200 px-6 py-3 rounded-full mt-4"
            >
              <Text className="text-black text-lg font-bold">
                ไปหน้า Fortune Teller
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
