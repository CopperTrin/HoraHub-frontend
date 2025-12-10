
import ScreenWrapper from '@/app/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';

type FTStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';
type FortuneTeller = {
  FortuneTellerID: string;
  UserID: string;
  Status: FTStatus;
  CVURL: string;
  Point: number;
  Bio: string | null;
};

type UserDetail = {
  UserID: string;
  Username: string;
  Role: string[];
  UserInfo?: {
    FirstName?: string;
    LastName?: string;
    PictureURL?: string;
    Email?: string;
    GoogleID?: string;
  };
};

const getBaseURL = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:3456' : 'http://localhost:3456';

const STATUS_TH: Record<FTStatus, string> = {
  PENDING: 'รอตรวจสอบ',
  ACTIVE: 'ใช้งาน',
  INACTIVE: 'ไม่อนุมัติ',
};

const STATUS_FILTERS: Array<{ key: 'ALL' | FTStatus; label: string }> = [
  { key: 'ALL', label: 'ทั้งหมด' },
  { key: 'PENDING', label: STATUS_TH.PENDING },
  { key: 'ACTIVE', label: STATUS_TH.ACTIVE },
  { key: 'INACTIVE', label: STATUS_TH.INACTIVE },
];

export default function VerifyFortuneTellerIndex() {
  const [items, setItems] = useState<FortuneTeller[]>([]);
  const [users, setUsers] = useState<Record<string, UserDetail>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | FTStatus>('ALL');
  const [search, setSearch] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const res = await axios.get<FortuneTeller[]>(`${getBaseURL()}/fortune-teller`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = res.data ?? [];
      setItems(list);

      const ids = Array.from(new Set(list.map((x) => x.UserID))).filter(Boolean);
      if (!ids.length) return;

      const fetched: Record<string, UserDetail> = { ...users };
      const toFetch = ids.filter((id) => !fetched[id]);

      if (toFetch.length) {
        const userResults = await Promise.allSettled(
          toFetch.map(async (id) => {
            const r = await axios.get<UserDetail>(`${getBaseURL()}/users/${id}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            return r.data;
          })
        );
        userResults.forEach((res) => {
          if (res.status === 'fulfilled' && res.value?.UserID) {
            fetched[res.value.UserID] = res.value;
          }
        });
        setUsers(fetched);
      }
    } catch (e: any) {
      console.log('GET /fortune-teller error:', e?.response?.data || e?.message || e);
      Alert.alert('ดึงข้อมูลล้มเหลว', 'ไม่สามารถโหลดรายชื่อหมอดูได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [users]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    const byStatus =
      statusFilter === 'ALL' ? items : items.filter((it) => it.Status === statusFilter);
    const q = search.trim().toLowerCase();
    if (!q) return byStatus;

    return byStatus.filter((it) => {
      const u = users[it.UserID];
      const first = u?.UserInfo?.FirstName ?? '';
      const last = u?.UserInfo?.LastName ?? '';
      const name = `${first} ${last}`.trim();
      const email = u?.UserInfo?.Email ?? '';
      const username = u?.Username ?? '';
      const bio = it.Bio ?? '';
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        username.toLowerCase().includes(q) ||
        bio.toLowerCase().includes(q) ||
        it.FortuneTellerID.toLowerCase().includes(q)
      );
    });
  }, [items, users, statusFilter, search]);

  const setStatus = async (id: string, status: FTStatus) => {
    try {
      setSavingId(id);
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        Alert.alert('ไม่มีสิทธิ์', 'ไม่พบโทเค็นผู้ดูแลระบบ โปรดเข้าสู่ระบบใหม่');
        return;
      }
      const res = await axios.patch<FortuneTeller>(
        `${getBaseURL()}/admin/fortune-teller/${id}`,
        { Status: status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        }
      );
      setItems((prev) => prev.map((x) => (x.FortuneTellerID === id ? res.data : x)));
    } catch (e: any) {
      console.log('PATCH /admin/fortune-teller/{id} error:', e?.response?.data || e?.message || e);
      Alert.alert('อัปเดตล้มเหลว', 'ไม่สามารถเปลี่ยนสถานะได้');
    } finally {
      setSavingId(null);
    }
  };

  const StatusPill = ({ status }: { status: FTStatus }) => {
    const style =
      status === 'PENDING'
        ? 'bg-yellow-500/20 text-yellow-300'
        : status === 'ACTIVE'
        ? 'bg-green-500/20 text-green-300'
        : 'bg-red-500/20 text-red-300';
    return (
      <View className={`px-2 py-1 rounded-full ${style.split(' ')[0]}`}>
        <Text className={`text-xs font-sans-semibold ${style.split(' ')[1]}`}>
          {STATUS_TH[status]}
        </Text>
      </View>
    );
  };

  const Card = ({ item }: { item: FortuneTeller }) => {
    const u = users[item.UserID];
    const avatar = u?.UserInfo?.PictureURL || 'https://dummyimage.com/80x80/222/aaa&text=FT';
    const name = `${u?.UserInfo?.FirstName ?? ''} ${u?.UserInfo?.LastName ?? ''}`.trim() || '—';
    const email = u?.UserInfo?.Email ?? '—';
    const username = u?.Username ?? '—';
    const roles = u?.Role ?? [];

    const isActive = item.Status === 'ACTIVE';
    const isInactive = item.Status === 'INACTIVE';

    return (
      <View className="rounded-2xl p-4 mb-3 border border-white/10 bg-white/5">
        {/* ส่วนหัว: รูป + ชื่อ + สถานะ */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <Image source={{ uri: avatar }} className="w-14 h-14 rounded-full bg-white/10" />
            <View className="flex-1">
              <Text className="text-white font-sans-semibold text-base" numberOfLines={1}>
                {name}
              </Text>
              <Text className="text-white/70 text-xs" numberOfLines={1}>
                @{username} · {email}
              </Text>
            </View>
          </View>
          <StatusPill status={item.Status} />
        </View>

        {/* Bio */}
        <Text className="text-white/80 text-sm mt-3">
          {item.Bio ? item.Bio : '—'}
        </Text>

        {/* แถวข้อมูล: คะแนน + บทบาท + CV */}
        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="stars" size={16} color="#FFD824" />
            <Text className="text-white/80 text-sm">คะแนน: {item.Point}</Text>
          </View>

          <View className="flex-row gap-1">
            {roles.slice(0, 3).map((r) => (
              <View key={r} className="px-2 py-1 rounded-lg bg-white/10">
                <Text className="text-white/70 text-xs">{r}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => {
              if (!item.CVURL) {
                Alert.alert('ไม่มีไฟล์ CV', 'หมอดูรายนี้ยังไม่ได้อัปโหลด CV');
                return;
              }
              Linking.openURL(item.CVURL).catch(() => {
                Alert.alert('เปิดลิงก์ไม่สำเร็จ', 'ไม่สามารถเปิดลิงก์ CV ได้');
              });
            }}
            className={`px-3 py-2 rounded-xl ${item.CVURL ? 'bg-accent-200' : 'bg-white/10'}`}
          >
            <Text className={`text-black font-sans-semibold ${item.CVURL ? '' : 'opacity-60'}`}>
              เปิด CV
            </Text>
          </Pressable>
        </View>

        {/* ปุ่มการตัดสินใจ */}
        <View className="flex-row gap-2 mt-3">
          <Pressable
            onPress={() => setStatus(item.FortuneTellerID, 'ACTIVE')}
            disabled={isActive || savingId === item.FortuneTellerID}
            className={`flex-1 h-11 rounded-xl items-center justify-center ${
              isActive || savingId === item.FortuneTellerID ? 'bg-green-500/40' : 'bg-green-500'
            }`}
          >
            {savingId === item.FortuneTellerID ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-black font-sans-semibold">อนุมัติ</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setStatus(item.FortuneTellerID, 'INACTIVE')}
            disabled={isInactive || savingId === item.FortuneTellerID}
            className={`flex-1 h-11 rounded-xl items-center justify-center ${
              isInactive || savingId === item.FortuneTellerID ? 'bg-red-500/40' : 'bg-red-500'
            }`}
          >
            {savingId === item.FortuneTellerID ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-black font-sans-semibold">ไม่อนุมัติ</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="text-white/80 mt-2">กำลังโหลดรายชื่อหมอดู…</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* ส่วนหัว */}
      <View className="px-4 pt-3 pb-2 border-b border-white/10 bg-primary-200">
        <Text className="text-white font-sans-semibold text-xl">ตรวจสอบ/ยืนยันหมอดู</Text>
        <Text className="text-white/60 text-xs mt-1">
          อ่าน CV และเปลี่ยนสถานะเป็น “ใช้งาน” หรือ “ไม่อนุมัติ”
        </Text>

        {/* ค้นหา & ตัวกรอง */}
        <View className="mt-3">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ค้นหา ชื่อ / อีเมล / ชื่อผู้ใช้ / Bio…"
            placeholderTextColor="#BEBFC3"
            className="bg-white/10 text-white rounded-xl px-4 h-11 font-sans"
            keyboardType="default"
            inputMode="text"
            autoCapitalize="none"
          />
          <View className="flex-row mt-3 gap-2">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setStatusFilter(f.key)}
                  className={`px-3 py-2 rounded-xl border ${
                    active ? 'bg-accent-200 border-accent-200' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Text className={`text-sm ${active ? 'text-black' : 'text-white/80'}`}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* รายการ */}
      <FlatList
        contentContainerClassName="p-4"
        data={filtered}
        keyExtractor={(it) => it.FortuneTellerID}
        renderItem={({ item }) => <Card item={item} />}
        ListEmptyComponent={
          <View className="py-16 items-center">
            <Image
              source={{ uri: 'https://dummyimage.com/240x120/2a2a2a/ffffff&text=No+results' }}
              className="w-60 h-28 mb-4 rounded-xl"
            />
            <Text className="text-white/70">ไม่พบรายการ</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      />
    </ScreenWrapper>
  );
}
