import ScreenWrapper from '@/app/components/ScreenWrapper';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';

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

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        //console.log(response.data);
        setUserInfo(response.data);
        const res = await axios.post(`${getBaseURL()}/auth/google/mobile`, {
          idToken,
          role: 'CUSTOMER', // or FORTUNE_TELLER
        });
        const token = res.data.access_token;
        // Save token with SecureStore / AsyncStorage
        await SecureStore.setItemAsync("access_token", token);
        console.log('Server response:', res.data);

        // Navigate to the protected route
        router.push('/(tabs)/profile');
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

  return (
    <ScreenWrapper>
      <View>
        <Text>Google Sign In</Text>
        {userInfo ? (
          <View>
            <Text>Welcome, {userInfo.user.name}!</Text>
            <Text>Email: {userInfo.user.email}</Text>
            <Text>Full Response:</Text>
            <ScrollView style={{ maxHeight: 200, backgroundColor: '#f0f0f0', padding: 10 }}>
              <Text style={{ fontSize: 12 }}>{JSON.stringify(userInfo, null, 2)}</Text>
            </ScrollView>
          </View>
        ) : (
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
