import ScreenWrapper from "@/app/components/ScreenWrapper";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Dimensions,
  Pressable,
} from "react-native";
import { useState } from "react";
import HeaderBar from "../../components/ui/HeaderBar";

// ขนาดหน้าจอ
const { width: screenWidth } = Dimensions.get("window");

// รูป mock
import product_1 from "@/assets/images/product/1.png";
import product_1_2 from "@/assets/images/product/1-2.jpg";
import product_2 from "@/assets/images/product/2.png";
import product_3 from "@/assets/images/product/3.png";
import product_4 from "@/assets/images/product/4.png";
import product_5 from "@/assets/images/product/5.png";
import product_6 from "@/assets/images/product/6.png";
import product_7 from "@/assets/images/product/7.png";
import product_8 from "@/assets/images/product/8.png";
import product_9 from "@/assets/images/product/9.png";

import prodile_img from "@/assets/images/product/fortune-teller/อาจารย์เเดง.jpg";

// Mock data สินค้าทั้งหมด
const products = [
  {
    id: "1",
    name: "เครื่องรางเสริมดวงการเงินแบบไทยๆ",
    price: 699,
    image: [product_1,product_1_2],
    link: "https://shopee.co.th",
    detail: 
      "เครื่องรางเสริมดวงการเงินแบบไทยๆ เป็นของมงคลที่ผ่านการปลุกเสกจากวัดดังและครูบาอาจารย์ผู้มีวิชาอาคมเข้มขลัง เชื่อกันว่าช่วยเรียกทรัพย์ โชคลาภ เงินทองไม่ขาดมือ เหมาะสำหรับพ่อค้าแม่ค้า เจ้าของกิจการ หรือผู้ที่ต้องการเสริมพลังแห่งความมั่งคั่ง พกพาง่าย วางบนโต๊ะทำงานก็ได้ หรือแขวนในกระเป๋าสตางค์ก็เป็นสิริมงคล ควรบูชาด้วยความศรัทธาและหมั่นภาวนาคาถาประจำทุกเช้า เพื่อให้พลังแห่งโชคลาภส่งเสริมได้อย่างเต็มที่",
  },
  {
    id: "2",
    name: "พระปิดตา",
    price: 5900,
    image: [product_2],
    link: "https://shopee.co.th",
    detail: 
      "พระปิดตาเป็นพระเครื่องที่ได้รับความนิยมสูงสุดในสายพระเครื่องไทย มีลักษณะเด่นคือองค์พระที่ปิดตา ปิดหู ปิดปาก ซึ่งสื่อถึงการปิดกั้นสิ่งชั่วร้ายทั้งปวง ป้องกันภัยอันตรายและสิ่งไม่ดีเข้าสู่ตัว นอกจากนี้ยังมีความเชื่อว่าช่วยเสริมโชคลาภ การค้าขายร่ำรวย และปกป้องผู้บูชาจากอันตรายทางจิตวิญญาณ เหมาะสำหรับผู้ที่อยู่ในวงการธุรกิจ หรือต้องเดินทางบ่อย ผู้บูชาควรเก็บรักษาในตลับผ้าหรือใส่กรอบทองเพื่อความงดงามและความทนทาน",
  },
  {
    id: "3",
    name: "ไซดักทรัพย์",
    price: 100,
    image: [product_3],
    link: "https://shopee.co.th",
    detail: 
      "ไซดักทรัพย์เป็นเครื่องรางพื้นบ้านที่นิยมกันมายาวนาน โดยเฉพาะในภาคเหนือและอีสานของไทย เชื่อกันว่าไซสามารถ 'ดักเงินดักทอง' จากทุกทิศทุกทาง เหมาะสำหรับพ่อค้าแม่ค้าและผู้ที่ทำอาชีพอิสระ การบูชาไซดักทรัพย์มักจะวางไว้ในร้านค้า โต๊ะทำงาน หรือหน้าบ้าน โดยให้ปากไซหันไปทางทิศตะวันออกหรือทิศเหนือซึ่งเป็นทิศแห่งโชคลาภ และควรตั้งบนพานรองพร้อมดอกไม้ธูปเทียนบูชา เพื่อเปิดทางรับทรัพย์ให้เข้ามาอย่างไม่ขาดสาย",
  },
  {
    id: "4",
    name: "เครื่องรางของต่างประเทศ รวมชุด",
    price: 1800,
    image: [product_4],
    link: "https://shopee.co.th",
    detail: 
      "เครื่องรางของต่างประเทศชุดนี้เป็นการรวมพลังแห่งความเชื่อจากหลากหลายวัฒนธรรม เช่น เหรียญ Saint Benedict จากอิตาลี ตุ๊กตามาเนกิเนโกะจากญี่ปุ่น และเกือกม้าจากยุโรปตอนเหนือ ทั้งหมดนี้ถูกคัดสรรและผ่านพิธีเสริมพลังให้เหมาะกับผู้ที่ต้องการพลังคุ้มครองรอบด้าน ทั้งการเงิน ความรัก และสุขภาพ เป็นชุดเครื่องรางที่เหมาะกับผู้ชื่นชอบของมงคลจากทั่วโลก สามารถวางบนโต๊ะทำงาน หิ้งบูชา หรือพกติดตัวก็ได้",
  },
  {
    id: "5",
    name: "น้ำเต้า",
    price: 299,
    image: [product_5],
    link: "https://shopee.co.th",
    detail: 
      "น้ำเต้าเป็นสัญลักษณ์แห่งความอุดมสมบูรณ์และความโชคดีในวัฒนธรรมจีนและไทย เชื่อกันว่าเป็นภาชนะเก็บทรัพย์ เก็บโชค และป้องกันสิ่งไม่ดีต่างๆ โดยเฉพาะในทางฮวงจุ้ย น้ำเต้ามักถูกนำไปแขวนไว้ที่หัวเตียงหรือหน้าบ้านเพื่อดูดซับพลังงานลบ และเสริมพลังงานชีวิตในบ้านให้สมดุล เหมาะสำหรับผู้ที่ต้องการเสริมสุขภาพ โชคลาภ และความมั่นคงในชีวิต ครูบาอาจารย์บางสายยังปลุกเสกให้มีพลังคุ้มครองเจ้าของจากภัยพิบัติและโรคภัยได้อีกด้วย",
  },
  {
    id: "6",
    name: "ปี่เซียะมงคล",
    price: 1000,
    image: [product_6],
    link: "https://shopee.co.th",
    detail: 
      "ปี่เซียะมงคลเป็นสัตว์ศักดิ์สิทธิ์ในตำนานจีนที่ไม่มีทวารขับถ่าย หมายถึงเงินทองที่เข้ามาแล้วไม่ไหลออก เหมาะอย่างยิ่งสำหรับผู้ที่ต้องการเสริมดวงด้านการเงิน การค้าขาย และโชคลาภ ปี่เซียะยังเป็นผู้พิทักษ์ป้องกันสิ่งชั่วร้ายและพลังลบต่างๆ ไม่ให้เข้ามากระทบเจ้าของ สามารถวางไว้บนโต๊ะทำงาน เคาน์เตอร์ร้านค้า หรือหิ้งพระ โดยหันหน้าไปทางประตูร้านหรือทิศเหนือ จะช่วยเปิดทางทรัพย์และความสำเร็จ",
  },
  {
    id: "7",
    name: "ด้ายแดง",
    price: 10,
    image: [product_7],
    link: "https://shopee.co.th",
    detail: 
      "ด้ายแดงแห่งโชคชะตาเป็นเครื่องรางยอดนิยมในสายความรัก เชื่อกันว่าเป็นสิ่งที่เชื่อมโยงดวงวิญญาณของคนสองคนให้มาพบกันและอยู่ร่วมกันอย่างมีความสุข ตามความเชื่อของญี่ปุ่นและจีน ด้ายแดงจะช่วยเสริมพลังความสัมพันธ์ ความเข้าใจ และความมั่นคงในความรัก เหมาะสำหรับผู้ที่กำลังมองหาความรักดีๆ หรือคู่ชีวิต สามารถสวมใส่ที่ข้อมือซ้าย หรือพกในกระเป๋าสตางค์ก็ได้ และควรภาวนาขอพรทุกคืนวันพระเพื่อเพิ่มพลังแห่งโชคชะตา",
  },
  {
    id: "8",
    name: "คางคกคาบเหรียญ",
    price: 890,
    image: [product_8],
    link: "https://shopee.co.th",
    detail: 
      "คางคกคาบเหรียญ หรือที่เรียกว่า ‘คางคกสามขา’ เป็นหนึ่งในสัญลักษณ์มงคลของจีนที่เชื่อกันว่าสามารถเรียกเงินเรียกทองเข้าบ้านได้ โดยเฉพาะถ้าวางไว้ในทิศตะวันออกเฉียงใต้ของบ้านหรือร้านค้า จะยิ่งเสริมพลังทรัพย์ให้ไหลมาเทมา เหมาะสำหรับพ่อค้าแม่ค้า นักธุรกิจ หรือผู้ที่ต้องการความเจริญรุ่งเรืองทางการเงิน การวางคางคกควรหันหน้าเข้าด้านในของบ้านหรือร้านเพื่อสื่อถึงการดูดทรัพย์เข้ามาอย่างไม่หยุดยั้ง",
  },
  {
    id: "9",
    name: "หินยูนาไคต์",
    price: 99,
    image: [product_9],
    link: "https://shopee.co.th",
    detail: 
      "หินยูนาไคต์ (Unakite) เป็นหินแห่งการเยียวยาและความสงบ มีพลังในการปรับสมดุลระหว่างจิตใจและร่างกาย ช่วยลดความเครียด ความวิตกกังวล และเสริมพลังให้กับความสัมพันธ์ระหว่างคนรัก เชื่อกันว่าหากพกหินยูนาไคต์ติดตัว จะช่วยเปิดใจให้พร้อมรับสิ่งดีๆ และโอกาสใหม่ๆ เข้ามาในชีวิต เหมาะกับผู้ที่ทำงานด้านศิลปะ จิตวิทยา หรือผู้ที่ต้องการพลังบวกเพื่อก้าวผ่านความเหนื่อยล้าในแต่ละวัน",
  },
];


export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);

  // หาสินค้าตาม id
  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <ScreenWrapper>
        <HeaderBar title="ไม่พบสินค้า" showBack />
        <View className="flex-1 justify-center items-center">
          <Text className="text-alabaster text-lg">ไม่พบข้อมูลสินค้าที่เลือก</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const handleBuy = () => {
    if (product.link) Linking.openURL(product.link);
  };

  return (
    <ScreenWrapper>
      <HeaderBar title={product.name} showBack showChat />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {/* รูปสินค้า */}
        <View className="mb-4">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const newIndex = Math.round(offsetX / screenWidth);
              setActiveIndex(newIndex);
            }}
            scrollEventThrottle={16}
          >
            {product.image.map((img, index) => (
              <Pressable key={index}>
                <Image
                  source={typeof img === "number" ? img : { uri: img }}
                  style={{
                    width: screenWidth - 32,
                    height: 250,
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* จุดบอกตำแหน่งรูป */}
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
            {product.image.map((_, index) => (
              <View
                key={index}
                className={`w-2.5 h-2.5 mx-1 rounded-full ${
                  activeIndex === index ? "bg-accent-200" : "bg-gray-400"
                }`}
              />
            ))}
          </View>
        </View>

        {/* ชื่อ + ราคา */}
        <Text className="text-alabaster text-xl font-bold mb-2">{product.name}</Text>
        <Text className="text-accent-200 text-2xl font-bold mb-3">฿{product.price}</Text>

        {/* ปุ่มสั่งซื้อ */}
        <TouchableOpacity
          onPress={handleBuy}
          className="bg-accent-200 rounded-full py-4 items-center mb-3"
        >
          <Text className="text-black text-lg font-bold">สั่งซื้อสินค้า</Text>
        </TouchableOpacity>

        {/* โปรไฟล์หมอดู */}
        <TouchableOpacity
          onPress={() => router.push(`/fortune_teller_profile/`)}
          className="flex-row items-center bg-primary-100 p-3 rounded-full mb-3"
        >
          <Image source={prodile_img} className="w-12 h-12 rounded-full" />
          <View className="flex-1 ml-4">
            <Text className="text-alabaster text-lg font-semibold">อาจารย์แดง</Text>
          </View>
          <Entypo name="chevron-small-right" size={32} color="#F8F8F8" />
        </TouchableOpacity>

        {/* รายละเอียดสินค้า */}
        <Text className="text-alabaster text-base leading-6 mb-10">{product.detail}</Text>
      </ScrollView>
    </ScreenWrapper>
  );
}
