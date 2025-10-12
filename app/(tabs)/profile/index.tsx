import ScreenWrapper from '@/app/components/ScreenWrapper';
import horahub_logo from '@/assets/images/horahub.png';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

type Role = 'CUSTOMER' | 'FORTUNE_TELLER' | 'ADMIN';

const getBaseURL = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:3456' : 'http://localhost:3456';

GoogleSignin.configure({
  webClientId:
    '797950834704-ld6utko8v934u4666gntlao07basljus.apps.googleusercontent.com',
  iosClientId:
    '797950834704-k6hgh7919oige4r5tmv6qbl1qg6s69o4.apps.googleusercontent.com',
});

export default function ProfileSignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  const redirectCustomer = () => router.replace('/(tabs)/profile/customer-profile');
  const redirectAdmin = () => router.replace('/(admin)/profile');
  const redirectFortuneTellerActive = () => router.replace('/(fortune-teller)/profile');
  const redirectFortuneTellerPending = () => router.replace('/apply-verification');

  const checkFortuneTellerAndRedirect = async (token: string) => {
    // 1) get user profile to know UserID
    const me = await axios.get(`${getBaseURL()}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userId = me.data?.UserID;
    if (!userId) {
      // safe fallback
      return redirectFortuneTellerPending();
    }
    // 2) check fortune teller status
    const ft = await axios.get(`${getBaseURL()}/fortune-teller/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const status = ft?.data?.Status;
    if (status === 'ACTIVE') return redirectFortuneTellerActive();
    return redirectFortuneTellerPending();
  };

  const redirectByRole = useCallback(
    async (role: Role, token?: string) => {
      if (role === 'CUSTOMER') return redirectCustomer();
      if (role === 'ADMIN') return redirectAdmin();
      if (role === 'FORTUNE_TELLER') {
        if (token) return checkFortuneTellerAndRedirect(token);
        // If token wasn't passed, pull from storage (for the boot-time auto-redirect case)
        const stored = await SecureStore.getItemAsync('access_token');
        if (stored) return checkFortuneTellerAndRedirect(stored);
        return redirectFortuneTellerPending();
      }
    },
    []
  );

  // Boot-time auto redirect if we already have token + role
  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('access_token');
      const role = (await SecureStore.getItemAsync('user_role')) as Role | null;
      if (token && role) {
        setLoading(false);
        return redirectByRole(role, token);
      }
      setLoading(false);
    })();
  }, [redirectByRole]);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return;

      const { idToken } = response.data;
      if (!idToken) throw new Error('No idToken from Google');

      // Store token for choose-role fallback
      await SecureStore.setItemAsync('last_id_token', idToken);

      // Extract Google ID / email for role lookup
      const u: any = response.data?.user ?? {};
      const googleId = u?.id || u?.user?.id || null;
      const email = u?.email || u?.user?.email || null;
      if (googleId) await SecureStore.setItemAsync('last_google_uid', String(googleId));

      // Check /users for existing role
      try {
        const resUsers = await axios.get(`${getBaseURL()}/users`);
        const list: any[] = resUsers.data || [];
        const found = list.find(
          (x) =>
            (googleId && x?.UserInfo?.GoogleID === String(googleId)) ||
            (email && x?.UserInfo?.Email?.toLowerCase() === String(email).toLowerCase())
        );

        const existingRole: Role | undefined = found?.Role?.[0];
        if (existingRole) {
          // Auto sign-in with existing role
          const resAuth = await axios.post(`${getBaseURL()}/auth/google/mobile`, {
            idToken,
            role: existingRole,
          });
          const accessToken = resAuth.data.access_token;
          await SecureStore.setItemAsync('access_token', accessToken);
          await SecureStore.setItemAsync('user_role', existingRole);

          setSigningIn(false);
          // ⬇️ NEW: if FORTUNE_TELLER, check status then route
          return redirectByRole(existingRole, accessToken);
        }
      } catch (err) {
        console.log('User lookup error:', err?.message || err);
      }

      // No role found → go choose-role
      setSigningIn(false);
      router.replace('/(tabs)/profile/choose-role');
    } catch (error: any) {
      setSigningIn(false);
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert('ไม่พบ Google Play Services', 'โปรดอัปเดตหรือเปิดใช้งานก่อน');
          return;
        }
      }
      console.log('Google sign-in error:', error?.message || error);
      Alert.alert('เข้าสู่ระบบล้มเหลว', 'โปรดลองอีกครั้ง');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-200">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white font-sans-semibold mt-2.5">
          กำลังโหลด...
        </Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center items-center gap-8">
        <View className="items-center">
          <Image source={horahub_logo} className="w-28 h-28 mb-6" />
          <Text className="text-white font-sans-semibold text-3xl">
            ยินดีต้อนรับสู่ Horahub
          </Text>
          <Text className="text-white font-sans-semibold text-xl">
            เข้าสู่ระบบด้วยบัญชี Google
          </Text>
        </View>

        <Pressable
          disabled={signingIn}
          onPress={handleGoogleSignIn}
          className="bg-accent-200 px-6 py-3 rounded-lg w-80 h-14 items-center justify-center"
        >
          {signingIn ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-black text-lg font-sans-semibold">
              เข้าสู่ระบบด้วย Google
            </Text>
          )}
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
