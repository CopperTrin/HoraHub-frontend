import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import colors from "../constants/Colors"; 

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: colors.primary[100],
          borderTopWidth: 0,         
          height: 84,                
          paddingBottom: 10,         
          paddingTop: 8, 
          // borderTopLeftRadius: 20,
          // borderTopRightRadius: 20,   
          position: "absolute",
          left: 0,
          right: 0,     
          paddingLeft :20 ,
          paddingRight:20,     
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "400",
          marginTop: 0,  
        },

        tabBarActiveTintColor: colors.accent[200],
        tabBarInactiveTintColor: colors.alabaster,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="p2p"
        options={{
          title: "P2P",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="people-arrows" size={size-6} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="shopping-bag" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" color={color} size={size} />
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
