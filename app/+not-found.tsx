import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />

      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.message}>ไม่พบหน้าที่คุณกำลังค้นหา</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0b1b", 
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 12,
  },
  message: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FFD700",
    borderRadius: 10,
  },
  linkText: {
    color: "#0f0b1b",
    fontWeight: "bold",
    fontSize: 16,
  },
});
