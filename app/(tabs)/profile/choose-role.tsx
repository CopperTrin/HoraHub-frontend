// app/(tabs)/profile/choose-role.tsx
import ScreenWrapper from '@/app/components/ScreenWrapper';
import {
    GoogleSignin,
    isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from 'react-native';

type Role = 'CUSTOMER' | 'FORTUNE_TELLER' | 'ADMIN';

const getBaseURL = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:3456' : 'http://localhost:3456';

export default function ChooseRole() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const redirectCustomer = () => router.replace('/(tabs)/profile/customer-profile');
  const redirectAdmin = () => router.replace('/(admin)/profile');
  const redirectFortuneTellerActive = () => router.replace('/(fortune-teller)/profile');
  const redirectFortuneTellerPending = () => router.replace('/apply-verification');

  const ensureIdToken = async (): Promise<string> => {
    const stored = await SecureStore.getItemAsync('last_id_token');
    if (stored) return stored;

    const r = await GoogleSignin.signInSilently();
    if (isSuccessResponse(r) && r.data?.idToken) return r.data.idToken;

    throw new Error('No idToken available');
  };

  const afterAuthRedirect = async (role: Role, token: string) => {
    if (role === 'CUSTOMER') return redirectCustomer();
    if (role === 'ADMIN') return redirectAdmin();
    if (role === 'FORTUNE_TELLER') {
      // check status via /fortune-teller/user/{userId}
      try {
        const me = await axios.get(`${getBaseURL()}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = me.data?.UserID;
        if (!userId) return redirectFortuneTellerPending();
        const ft = await axios.get(`${getBaseURL()}/fortune-teller/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const status = ft?.data?.Status;
        if (status === 'ACTIVE') return redirectFortuneTellerActive();
        return redirectFortuneTellerPending();
      } catch {
        return redirectFortuneTellerPending();
      }
    }
  };

  const choose = async (role: Role) => {
    try {
      setBusy(true);
      const idToken = await ensureIdToken();
      const res = await axios.post(`${getBaseURL()}/auth/google/mobile`, { idToken, role });

      const accessToken = res.data.access_token;
      await SecureStore.setItemAsync('access_token', accessToken);
      await SecureStore.setItemAsync('user_role', role);

      await afterAuthRedirect(role, accessToken);
    } catch (e: any) {
      console.log('Choose role error:', e?.message || e);
      Alert.alert('ไม่สามารถเข้าสู่ระบบ', 'โปรดลองเลือกบทบาทอีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 items-center justify-center gap-5">
        <Text className="text-white font-sans-semibold text-2xl">เลือกบทบาทในการใช้งาน</Text>
        <Text className="text-white/70">บัญชีหนึ่งสามารถใช้ได้เพียง 1 บทบาท</Text>

        <Pressable
          disabled={busy}
          onPress={() => choose('CUSTOMER')}
          className="bg-accent-200 px-6 py-3 rounded-lg w-80 h-14 items-center justify-center"
        >
          {busy ? <ActivityIndicator /> : <Text className="text-black font-sans-semibold">เข้าสู่ระบบเป็น ลูกค้า</Text>}
        </Pressable>

        <Pressable
          disabled={busy}
          onPress={() => choose('FORTUNE_TELLER')}
          className="bg-accent-200 px-6 py-3 rounded-lg w-80 h-14 items-center justify-center"
        >
          {busy ? <ActivityIndicator /> : <Text className="text-black font-sans-semibold">เข้าสู่ระบบเป็น หมอดู</Text>}
        </Pressable>

        <Pressable
          disabled={busy}
          onPress={() => choose('ADMIN')}
          className="bg-accent-200 px-6 py-3 rounded-lg w-80 h-14 items-center justify-center"
        >
          {busy ? <ActivityIndicator /> : <Text className="text-black font-sans-semibold">เข้าสู่ระบบเป็น ผู้ดูแลระบบ</Text>}
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
