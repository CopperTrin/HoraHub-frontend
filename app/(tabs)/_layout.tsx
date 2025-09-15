import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import '../global.css';

export default function TabsLayout() {
  return (
  <Tabs 
  screenOptions={{
    tabBarActiveTintColor: '#ffd824',
    tabBarStyle: { backgroundColor: '#211a3a', height: 60, paddingBottom: 4, paddingTop: 4 },
    headerStyle: { backgroundColor: '#140E25'},
    tabBarPosition: 'bottom',
    headerTitleStyle: { color: '#fff', fontSize: 20, fontWeight: 'bold'}
  }}
  >
    <Tabs.Screen name="Home"
    options={{ headerTitle : "Home",
      tabBarIcon: ({ color, size }) => (
        <FontAwesome name="home" color={color} size={size} />
      ),
    }}/>
    <Tabs.Screen name="P2P"
    options={{ headerTitle : "P2P",
      tabBarIcon: ({ color, size }) => (
        <FontAwesome name="users" color={color} size={size} />
      ),
    }} />
    <Tabs.Screen name="Shop"
    options={{ headerTitle : "Shop",
      tabBarIcon: ({ color, size }) => (
        <FontAwesome name="shopping-bag" color={color} size={size} />
      ),
    }} />
    <Tabs.Screen name="Notification" 
    options={{ headerTitle : "Notification",
      tabBarIcon: ({ color, size }) => (
        <FontAwesome name="bell" color={color} size={size} />
      ),
    }} />
  </Tabs>
  );
}