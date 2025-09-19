import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View, Image, TextInput } from "react-native";
import { useState } from "react";

type HeaderBarProps = {
  title: string;
  showBack?: boolean;
  rightIcons?: { name: keyof typeof MaterialIcons.glyphMap; onPress?: () => void }[];
  showChat?: boolean;
  showSearch?: boolean;
  onSearchSubmit?: (query: string) => void; 
};

export default function HeaderBar({
  title,
  showBack,
  rightIcons,
  showChat = false,
  showSearch = false,
  onSearchSubmit,
}: HeaderBarProps) {
  const router = useRouter();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearchToggle = () => setSearchVisible((prev) => !prev);

  const handleSearchSubmit = () => {
    if (onSearchSubmit) {
      onSearchSubmit(searchText); // ส่งค่ากลับไป
    } else {
      console.log("Search input:", searchText);
    }
    setSearchVisible(false);
    setSearchText("");
  };

  return (
    <View className="bg-primary-200 flex-row items-center justify-between px-5 h-16">
      <View className="flex-row items-center">
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={24} color="#F8F8F8" />
          </TouchableOpacity>
        ) : (
          <Image
            source={require("@/assets/images/horahub.png")}
            className="w-10 h-10"
            resizeMode="contain"
          />
        )}
        <Text className="color-alabaster text-2xl font-semibold ml-2">
          {title}
        </Text>
      </View>

      <View className="flex-row items-center">
        

        {/* ปุ่ม search + input */}
        {showSearch && (
          <>
            <TouchableOpacity onPress={handleSearchToggle} className="ml-4">
              <MaterialIcons
                name={searchVisible ? "close" : "search"}
                size={24}
                color="#F8F8F8"
              />
            </TouchableOpacity>

            {searchVisible && (
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearchSubmit}
                placeholder="Search..."
                placeholderTextColor="#ccc"
                className="bg-white rounded px-2 ml-2 w-40"
                returnKeyType="search"
              />
            )}
          </>
        )}

        {/* ปุ่ม chat */}
        {showChat && (
          <TouchableOpacity onPress={() => router.push("/chat")} className="ml-4">
            <MaterialIcons
              name="chat-bubble-outline"
              size={24}
              color="#F8F8F8"
            />
          </TouchableOpacity>
        )}

        {/* ปุ่มไอคอนอื่น */}
        {rightIcons?.map((icon, idx) => (
          <TouchableOpacity key={idx} onPress={icon.onPress} className="ml-4">
            <MaterialIcons name={icon.name} size={24} color="#F8F8F8" />
          </TouchableOpacity>
        ))}
        
      </View>
    </View>
  );
}
