import ScreenWrapper from "@/app/components/ScreenWrapper";
import HeadersBar from "@/app/components/ui/HeaderBar";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import fcomponent from "../../fcomponent";

const ReportDetail = () => {
  const route = useRoute();
  const [report, setReport] = useState<Report[]>([]);
  const [reason, setReason] = useState<string>();
  const [detail, setDetail] = useState<string>();
  const { reportId } = route.params as { reportId: string };
  const API_URL = fcomponent.getBaseURL();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await fcomponent.getToken();
        const res = await axios.get(`${API_URL}/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data)
        setReason(res.data.Reason)
        setDetail(res.data.Description)
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
      }
    };

    fetchData();
  }, []);

  const caseDismissed = async () => {
    try {
      const token = await fcomponent.getToken();
      const response = await axios.delete(`${API_URL}/reports/${reportId}`,
        {headers: { Authorization: `Bearer ${token}`}
      });

      if (response.status) {
        Alert.alert("ยกคำร้องเรียบร้อย", "การรายงานไม่มีมูล");
        router.replace("/chat-report");
      } else {
        Alert.alert("ผิดพลาด", "ส่งข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Report error:", error);
      Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const caseReasonable = () => {
    Alert.alert("คำร้องมีมูล", "ดำเนินการพิจารณาต่อไป");
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <HeadersBar 
        title="Report Details" 
        showBack />

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-2">
        <Text className="text-alabaster text-xl font-bold mb-2">
          เหตุผล
        </Text>

        <Text className="flex-1 text-alabaster mb-4">
            {reason}
        </Text>

        <Text className="text-alabaster text-xl font-bold mb-2">
            รายละเอียดของการสนทนาที่ไม่เหมาะสม
        </Text>

        <Text className="flex-1 text-alabaster mb-12">
            {detail}
        </Text>

        <View className="flex-row justify-center">
            <TouchableOpacity
                className="bg-green-500 rounded-2xl p-6 m-8"
                onPress={caseReasonable}
                >
                <Text className="text-blackpearl font-semibold text-xl text-center">
                    รับเรื่อง
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="bg-red-500 rounded-2xl p-6 m-8"
                onPress={caseDismissed}
                >
                <Text className="text-alabaster font-semibold text-xl text-center">
                    ไม่รับเรื่อง
                </Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ReportDetail;