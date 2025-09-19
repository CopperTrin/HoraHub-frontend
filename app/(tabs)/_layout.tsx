import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs } from "expo-router";
import '../global.css';
export default function TabLayout() {
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

        tabBarActiveTintColor: '#FFD824',
        tabBarInactiveTintColor: '#F8F8F8',
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