import ScreenWrapper from "@/app/components/ScreenWrapper";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type WalletMe = {
  AccountingID: string;
  Balance_Number: number;
  Label: string; // FORTUNE_TELLER
  UserID: string;
};

type Payment = {
  PaymentID: string;
  Transaction_Status: "PENDING" | "COMPLETED" | "FAILED" | string;
  Transaction_Date: string;
  Type: "DEPOSIT" | "WITHDRAWAL" | string;
  AccountingID: string;
  Amount: number;
  Method: string;
  Receipt: any | null;
  Accounting?: WalletMe;
};

export default function FortuneTellerWalletPage() {
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const [wallet, setWallet] = useState<WalletMe | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Deposit modal state
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [depositResult, setDepositResult] = useState<{
    PaymentId: string;
    Amount: number;
    Currency: string;
    Method: string;
    Address: string;
    Type: string;
  } | null>(null);
  const [depositError, setDepositError] = useState<string>("");
  const [confirmError, setConfirmError] = useState<string>("");

  // Withdraw modal state
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<{
    PaymentId: string;
    Amount: number;
    Currency: string;
    Method: string;
    Address: string;
    Type: string;
  } | null>(null);
  const [withdrawError, setWithdrawError] = useState<string>("");

  const getBaseURL = () =>
    Platform.OS === "android" ? "http://10.0.2.2:3456" : "http://localhost:3456";

  const formatTHB = (n?: number) => {
    if (typeof n !== "number") return "—";
    try {
      return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${n.toLocaleString("th-TH")} บาท`;
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("th-TH");
  };

  const getErrMsg = (e: any, fallback = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง") => {
    try {
      return e?.response?.data?.message || e?.message || fallback;
    } catch {
      return fallback;
    }
  };

  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;
      const res = await axios.get<WalletMe>(
        `${getBaseURL()}/accounting/fortune-teller/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWallet(res.data);
    } catch (e: any) {
      console.log("wallet error", e?.response?.data || String(e));
      setWallet(null);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;
      const res = await axios.get<Payment[]>(
        `${getBaseURL()}/payment/fortune-teller/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(res.data || []);
    } catch (e: any) {
      console.log("payments error", e?.response?.data || String(e));
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  // initial load
  useState(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchWallet(), fetchPayments()]);
      setLoading(false);
    })();
  });

  const sortedPayments = useMemo(
    () =>
      [...payments].sort(
        (a, b) =>
          new Date(b.Transaction_Date).getTime() -
          new Date(a.Transaction_Date).getTime()
      ),
    [payments]
  );

  // Create deposit (FT label)
  const handleDeposit = useCallback(async () => {
    setDepositError("");
    const val = parseFloat(depositAmount);
    if (!Number.isFinite(val) || val <= 0) {
      setDepositError("จำนวนเงินไม่ถูกต้อง");
      return;
    }
    setDepositLoading(true);
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;
      const body = {
        Amount: val,
        Method: "CRYPTOCURRENCY",
        Transaction_Status: "PENDING",
        Label: "FORTUNE_TELLER",
        Type: "DEPOSIT",
      };
      const res = await axios.post(`${getBaseURL()}/payment/deposit`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      setDepositResult(res.data);
      setConfirmError("");
    } catch (e: any) {
      console.log("deposit error", e?.response?.data || String(e));
      setDepositError(getErrMsg(e, "ไม่สามารถสร้างคำขอฝากเงินได้"));
      setDepositResult(null);
    } finally {
      setDepositLoading(false);
    }
  }, [depositAmount]);

  // Confirm payment for deposit
  const handleConfirmDeposit = useCallback(async () => {
    if (!depositResult?.PaymentId || !depositResult?.Address) return;
    setConfirmError("");
    setConfirmLoading(true);
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;
      const body = {
        PaymentId: depositResult.PaymentId,
        ContractAddress: depositResult.Address,
      };
      await axios.post(`${getBaseURL()}/payment/confirm-payment`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      });
      await Promise.all([fetchWallet(), fetchPayments()]);
    } catch (e: any) {
      const msg = getErrMsg(e, "ยืนยันการชำระเงินไม่สำเร็จ");
      console.log("confirm error", e?.response?.data || String(e));
      setConfirmError(msg);
    } finally {
      setConfirmLoading(false);
    }
  }, [depositResult, fetchWallet, fetchPayments]);

  // Create withdrawal (FT label)
  const handleWithdraw = useCallback(async () => {
    setWithdrawError("");
    const val = parseFloat(withdrawAmount);
    const addr = (withdrawAddress || "").trim();
    const userId = wallet?.UserID;
    if (!Number.isFinite(val) || val <= 0) {
      setWithdrawError("จำนวนเงินไม่ถูกต้อง");
      return;
    }
    if (!addr) {
      setWithdrawError("กรุณากรอกที่อยู่กระเป๋าปลายทาง");
      return;
    }
    if (!userId) {
      setWithdrawError("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    setWithdrawLoading(true);
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;

      const body = {
        Amount: val,
        Transaction_Status: "PENDING",
        Transaction_Date: new Date().toISOString(),
        Method: "CRYPTOCURRENCY",
        UserId: userId,
        Label: "FORTUNE_TELLER",
        Type: "WITHDRAWAL",
        receiver: addr,
      };

      const res = await axios.post(`${getBaseURL()}/payment/withdraw`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });

      setWithdrawResult(res.data);
      await Promise.all([fetchWallet(), fetchPayments()]);
    } catch (e: any) {
      const msg = getErrMsg(e, "ไม่สามารถถอนเงินได้");
      console.log("withdraw error", e?.response?.data || String(e));
      setWithdrawError(msg);
      setWithdrawResult(null);
    } finally {
      setWithdrawLoading(false);
    }
  }, [withdrawAmount, withdrawAddress, wallet?.UserID, fetchWallet, fetchPayments]);

  const openDeposit = () => {
    setDepositOpen(true);
    setDepositAmount("");
    setDepositResult(null);
    setDepositError("");
    setConfirmError("");
  };

  const openWithdraw = () => {
    setWithdrawOpen(true);
    setWithdrawAmount("");
    setWithdrawAddress("");
    setWithdrawResult(null);
    setWithdrawError("");
  };

  const closeDepositModal = () => {
    if (!depositResult && !depositLoading) setDepositOpen(false);
  };

  const forceCloseDepositModal = () => {
    if (depositLoading || confirmLoading) return;
    setDepositOpen(false);
    setDepositAmount("");
    setDepositResult(null);
    setDepositError("");
    setConfirmError("");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-200">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-2 font-sans-semibold">Loading…</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView className="mb-20" bounces={false} overScrollMode="never">
        {/* Header */}
        <View className="flex-row items-center mt-4 px-4">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 rounded-full p-2 active:opacity-70"
          >
            <MaterialIcons name="arrow-back-ios" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-xl font-sans-semibold">กระเป๋าเงิน</Text>
        </View>

        {/* Balance */}
        <View className="mx-4 mt-4 bg-primary-100 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="account-balance-wallet" size={24} color="white" />
              <Text className="text-white font-sans-semibold text-xl">ยอดคงเหลือ</Text>
            </View>
            {walletLoading ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-white font-sans-bold text-2xl">
                {formatTHB(wallet?.Balance_Number)}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 mt-3">
            <Pressable
              onPress={openDeposit}
              className="bg-accent-200 rounded-xl px-4 py-2"
            >
              <Text className="text-blackpearl font-sans-medium">ฝากเงิน</Text>
            </Pressable>
            <Pressable
              onPress={openWithdraw}
              className="bg-primary-200 rounded-xl px-4 py-2"
            >
              <Text className="text-white font-sans-medium">ถอนเงิน</Text>
            </Pressable>
          </View>
        </View>

        {/* Payment History */}
        <View className="mx-4 mt-6 mb-8">
          <Text className="text-white font-sans-bold text-xl mb-3">ประวัติธุรกรรม</Text>
          {paymentsLoading ? (
            <ActivityIndicator />
          ) : sortedPayments.length === 0 ? (
            <Text className="text-white/80">ยังไม่มีธุรกรรม</Text>
          ) : (
            sortedPayments.map((p) => (
              <View
                key={p.PaymentID}
                className="bg-primary-100 rounded-xl p-3 mb-3 flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-white font-sans-semibold">
                    {p.Type === "DEPOSIT" ? "ฝากเข้า" : p.Type === "WITHDRAWAL" ? "ถอนออก" : p.Type}
                  </Text>
                  <Text className="text-white/80 text-sm">{formatDateTime(p.Transaction_Date)}</Text>
                  <Text className="text-white/70 text-xs mt-1">{p.Method}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white font-sans-bold">
                    {p.Type === "DEPOSIT" ? "+" : "-"}
                    {formatTHB(p.Amount)}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${
                      p.Transaction_Status === "COMPLETED"
                        ? "text-green-300"
                        : p.Transaction_Status === "FAILED"
                        ? "text-red-300"
                        : "text-yellow-200"
                    }`}
                  >
                    {p.Transaction_Status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={depositOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDepositModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            className="bg-primary-200"
            style={{ width: "85%", borderRadius: 16, padding: 16, gap: 12, position: "relative" }}
          >
            <Text className="text-white font-sans-semibold text-xl">ฝากเงิน</Text>

            {/* X button only when details are visible */}
            {depositResult && (
              <Pressable
                onPress={forceCloseDepositModal}
                className="absolute right-2 top-2 p-2 rounded-full"
                android_ripple={{ color: "#ffffff22", borderless: true }}
              >
                <MaterialIcons name="close" size={22} color="white" />
              </Pressable>
            )}

            {!depositResult ? (
              <>
                <Text className="text-white/90">ระบุจำนวนเงิน (THB)</Text>
                <TextInput
                  value={depositAmount}
                  onChangeText={(t) => { setDepositAmount(t); setDepositError(""); }}
                  placeholder="เช่น 100"
                  placeholderTextColor="#ffffff99"
                  keyboardType="numeric"
                  className="bg-primary-100 text-white rounded-xl px-4 py-3"
                />

                {!!depositError && (
                  <Text className="text-red-300 mt-1">{depositError}</Text>
                )}

                <Pressable
                  disabled={depositLoading}
                  onPress={handleDeposit}
                  className="bg-accent-200 rounded-xl px-4 py-3 mt-2 items-center"
                >
                  {depositLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-blackpearl font-sans-semibold">สร้างคำขอฝากเงิน</Text>
                  )}
                </Pressable>

                {/* Allow cancel in input step */}
                <Pressable onPress={closeDepositModal} className="mt-2 items-center">
                  <Text className="text-white/80">ยกเลิก</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="text-white/90">ส่งคริปโตตามรายละเอียด แล้วกดยืนยัน</Text>
                <View className="bg-primary-100 rounded-xl p-3">
                  <Text className="text-white">PaymentId: {depositResult.PaymentId}</Text>
                  <Text className="text-white">
                    โทเคนที่ต้องโอน: {depositResult.Amount} {depositResult.Currency}
                  </Text>
                  <Text className="text-white" selectable>
                    Address: {depositResult.Address}
                  </Text>
                  <Text className="text-white/80 text-xs mt-1">Method: {depositResult.Method}</Text>
                </View>

                {!!confirmError && (
                  <Text className="text-red-300 mt-2">{confirmError}</Text>
                )}

                <Pressable
                  disabled={confirmLoading}
                  onPress={handleConfirmDeposit}
                  className="bg-accent-200 rounded-xl px-4 py-3 mt-2 items-center"
                >
                  {confirmLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-blackpearl font-sans-semibold">ยืนยันการชำระเงิน</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={withdrawOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!withdrawLoading) setWithdrawOpen(false);
        }}
      >
        <Pressable
          onPress={() => {
            if (!withdrawLoading) setWithdrawOpen(false);
          }}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pressable
            onPress={() => {}}
            className="bg-primary-200"
            style={{ width: "85%", borderRadius: 16, padding: 16, gap: 12 }}
          >
            <Text className="text-white font-sans-semibold text-xl">ถอนเงิน</Text>

            {!withdrawResult ? (
              <>
                <Text className="text-white/90">ระบุจำนวนเงิน (THB)</Text>
                <TextInput
                  value={withdrawAmount}
                  onChangeText={(t) => { setWithdrawAmount(t); setWithdrawError(""); }}
                  placeholder="เช่น 100"
                  placeholderTextColor="#ffffff99"
                  keyboardType="numeric"
                  className="bg-primary-100 text-white rounded-xl px-4 py-3"
                />
                <Text className="text-white/90 mt-2">ที่อยู่กระเป๋าปลายทาง (Receiver)</Text>
                <TextInput
                  value={withdrawAddress}
                  onChangeText={(t) => { setWithdrawAddress(t); setWithdrawError(""); }}
                  placeholder="0x..."
                  placeholderTextColor="#ffffff99"
                  autoCapitalize="none"
                  className="bg-primary-100 text-white rounded-xl px-4 py-3"
                />

                {!!withdrawError && (
                  <Text className="text-red-300 mt-1">{withdrawError}</Text>
                )}

                <Pressable
                  disabled={withdrawLoading}
                  onPress={handleWithdraw}
                  className="bg-accent-200 rounded-xl px-4 py-3 mt-2 items-center"
                >
                  {withdrawLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-blackpearl font-sans-semibold">ยืนยันการถอน</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                <Text className="text-white/90">คำขอถอนเงินถูกสร้างแล้ว</Text>
                <View className="bg-primary-100 rounded-xl p-3">
                  <Text className="text-white">PaymentId: {withdrawResult.PaymentId}</Text>
                  <Text className="text-white">
                    จำนวนคริปโตโดยประมาณ: {withdrawResult.Amount} {withdrawResult.Currency}
                  </Text>
                  <Text className="text-white" selectable>
                    ส่งไปที่: {withdrawResult.Address}
                  </Text>
                  <Text className="text-white/80 text-xs mt-1">Method: {withdrawResult.Method}</Text>
                </View>

                <Pressable
                  onPress={() => {
                    setWithdrawOpen(false);
                    setWithdrawAmount("");
                    setWithdrawAddress("");
                    setWithdrawResult(null);
                    setWithdrawError("");
                  }}
                  className="bg-primary-100 rounded-xl px-4 py-3 mt-2 items-center"
                >
                  <Text className="text-white font-sans-semibold">ปิด</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}
