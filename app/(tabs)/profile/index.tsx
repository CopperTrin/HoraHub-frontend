import ScreenWrapper from '@/app/components/ScreenWrapper';
import horahub_logo from '@/assets/images/horahub.png';
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
import { Alert, Button, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
          role: 'CUSTOMER', // or FORTUNE_TELLER
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
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <ScreenWrapper>
      <View>
        <Text>Google Sign In</Text>
        {userInfo ? (
          <View>
            <Text className='text-white'>Welcomes, {userInfo.FirstName} {userInfo.LastName}!</Text>
            <Text className='text-white'>Email, {userInfo.Email}!</Text>
            <Image
              source={{ uri: userInfo.PictureURL }}
              style={{ width: 100, height: 100, borderRadius: 50, marginVertical: 10 }}
            />
            <Text className='text-white'>Full Response:</Text>
            <ScrollView style={{ maxHeight: 200, backgroundColor: '#f0f0f0', padding: 10 }}>
              <Text style={{ fontSize: 12 }}>{JSON.stringify(userInfo, null, 2)}</Text>
            </ScrollView>
            <Button title="Sign Out" onPress={googleSignOut} />
            <TouchableOpacity
              onPress={() => router.push("/(fortune-teller)/dashboard")}
              className="bg-accent-200 px-6 py-3 rounded-full"
            >
              <Text className="text-black text-lg font-bold">
                ไปหน้า Fortune Teller
              </Text>
            </TouchableOpacity>
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
