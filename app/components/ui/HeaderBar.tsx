import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View, Image, TextInput, Pressable } from "react-native";
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

  const handleSearchSubmit = () => {
    onSearchSubmit?.(searchText);
    setSearchVisible(false);
    setSearchText("");
  };

  return (
    <>
      {/* Header ปกติ */}
      {!searchVisible && (
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
          {showSearch && (
            <TouchableOpacity onPress={() => setSearchVisible(true)} className="ml-4">
              <MaterialIcons name="search" size={24} color="#F8F8F8" />
            </TouchableOpacity>
          )}
          {showChat && (
            <TouchableOpacity onPress={() => router.push("/chat")} className="ml-4">
              <MaterialIcons name="chat-bubble-outline" size={24} color="#F8F8F8" />
            </TouchableOpacity>
          )}
          {rightIcons?.map((icon, idx) => (
            <TouchableOpacity key={idx} onPress={icon.onPress} className="ml-4">
              <MaterialIcons name={icon.name} size={24} color="#F8F8F8" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      )}

      {/* Overlay Search */}
      {searchVisible && (
        <Pressable
          onPress={() => setSearchVisible(false)}
          className=" bg-primary-200 flex-row items-center px-5 h-16"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()} 
            className="flex-row flex-1 items-center rounded-full bg-primary-100 px-4 py-2"
          >
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="พิมพ์คำค้นหา..."
              placeholderTextColor="#ccc"
              className="flex-1 text-white"
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              autoFocus
            />
            <TouchableOpacity onPress={handleSearchSubmit}>
              <MaterialIcons name="search" size={24} color="#F8F8F8" />
            </TouchableOpacity>
          </Pressable>

          <TouchableOpacity
            onPress={() => setSearchVisible(false)}
            className="ml-3"
          >
            <MaterialIcons name="close" size={28} color="#F8F8F8" />
          </TouchableOpacity>
        </Pressable>
      )}

    </>
  );
}
