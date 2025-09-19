import HomeNews from "@/app/components/home/home_news";
import ScreenWrapper from "@/app/components/ScreenWrapper";
import React from "react";
import { View } from "react-native";
import home_new_01 from "../../../assets/images/home/home_new_01.png";
import home_new_02 from "../../../assets/images/home/home_new_02.jpg";
import home_new_03 from "../../../assets/images/home/home_new_03.jpg";

export default function HomePage() {
  const images = [home_new_03, home_new_02, home_new_01];

  return (
    <ScreenWrapper>
      <View>
        <HomeNews
          images={images}
          height={240}
          dotActiveClass="bg-accent-200"
          dotClass="bg-alabaster"
        />
        {/* ...rest of your feed */}
      </View>
    </ScreenWrapper>
  );
}