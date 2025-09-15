import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import './global.css';

export default function RootLayout() {
  return (
  <>
    <StatusBar style="light" />
    <Stack
      screenOptions={{ 
        headerStyle: { backgroundColor: '#140E25'},
        headerShadowVisible: false,
        headerTitleStyle: { color: '#f8f8f8', fontSize: 20, fontWeight: 'bold'},
        headerTintColor: '#f8f8f8'
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="review" options={{ headerTitle: "Review..."}} />
      <Stack.Screen name="payment_success" options={{ headerTitle: "Payment Success"}} />
      <Stack.Screen name="Not_found" options={{ headerTitle: "Oops!"}} />
    </Stack>
  </>
  );
}