import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

const getBaseURL = () =>
  Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";

type Role = "CUSTOMER" | "FORTUNE_TELLER" | "ADMIN";

export default function RoleRedirect() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        const role = (await SecureStore.getItemAsync("user_role")) as Role | null;

        if (!token || !role) {
          router.replace("/(tabs)/home"); // guest
          return;
        }

        if (role === "CUSTOMER") return router.replace("/(tabs)/home");
        if (role === "ADMIN") return router.replace("/(admin)/fortune-teller-verify");

        if (role === "FORTUNE_TELLER") {
          const me = await axios.get(`${getBaseURL()}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userId = me.data?.UserID;
          if (!userId) return router.replace("/apply-verification");

          const ft = await axios.get(`${getBaseURL()}/fortune-teller/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const status = ft?.data?.Status;
          if (status === "ACTIVE")
            return router.replace("/(fortune-teller)/dashboard");
          return router.replace("/apply-verification");
        }

        router.replace("/(tabs)/home");
      } catch (err) {
        console.error("Role redirect failed:", err);
        router.replace("/(tabs)/home");
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View className="flex-1 justify-center items-center bg-[#211A3A]">
        <ActivityIndicator size="large" color="#FFD824" />
      </View>
    );
  }

  return null;
}
