import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#211A3A',
          borderTopWidth: 0,
          height: 84,
          paddingBottom: 10,
          paddingTop: 8,
          position: "absolute",
          left: 0,
          right: 0,
          paddingLeft: 20,
          paddingRight: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "400",
          marginTop: 0,
        },
        tabBarActiveTintColor: '#FFD824',
        tabBarInactiveTintColor: '#F8F8F8',
      }}
    >
      <Tabs.Screen
        name="fortune-teller-verify"
        options={{
          title: "Verify",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat-report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-month" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="systems"
        options={{
          title: "Systems",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="build" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
