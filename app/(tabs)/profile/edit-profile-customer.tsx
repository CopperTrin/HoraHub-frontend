import ScreenWrapper from '@/app/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const getBaseURL = () => "https://softdev-horahub-backend-production.up.railway.app";

export default function EditProfileCustomer() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

  const [userInfo, setUserInfo] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (!token) {
          console.log('No access token — redirecting to /profile');
          setLoading(false);
          router.replace('/profile');
          return;
        }

        const res = await axios.get(`${getBaseURL()}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserInfo(res.data);
        setEmail(res.data?.Email ?? '');
        setFirstName(res.data?.FirstName ?? '');
        setLastName(res.data?.LastName ?? '');
      } catch (error: any) {
        if (error?.response) {
          console.log('Error fetching profile:', error.response.status, error.response.data);
        } else {
          console.log('Error fetching profile:', error.message || error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const pickAndUploadPicture = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access.');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.length) return;
  
      const asset = result.assets[0];
      let uri = asset.uri;
      if (uri && !uri.startsWith('file://') && !uri.startsWith('content://')) {
        uri = `file://${uri}`;
      }
  
      const exists = await FileSystem.getInfoAsync(uri);
      if (!exists.exists) {
        Alert.alert('File error', 'Selected file not found.');
        return;
      }
  
      let filename = asset.fileName || (uri.split('/').pop() ?? '');
      if (!filename.includes('.')) filename += '.jpg';
      const ext = (filename.split('.').pop() || '').toLowerCase();
      const mime =
        asset.mimeType ||
        (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg');
  
      setUserInfo((prev: any) => ({ ...prev, PictureURL: uri }));
      setUploadingPic(true);
  
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        Alert.alert('Session expired', 'Please sign in again.');
        router.replace('/profile');
        return;
      }
  
      const filePart = { uri, name: filename, type: mime } as any;
  
      const form = new FormData();
      form.append('file', filePart);
  
      const res = await fetch(`${getBaseURL()}/users/profile/picture`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
        body: form,
      });
  
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} ${txt}`);
      }
  
      Alert.alert('Success', 'Profile picture updated.');
    } catch (e: any) {
      console.log('Upload error:', e?.message || e);
      Alert.alert('Upload failed', 'Network request failed. Try again.');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        Alert.alert('Session expired', 'Please sign in again.');
        router.replace('/profile');
        return;
      }

      const userId = userInfo?.UserID;
      if (!userId) {
        Alert.alert('Cannot save', 'Missing UserID from profile payload.');
        return;
      }

      const detailRes = await axios.get(`${getBaseURL()}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detail = detailRes.data;

      const body = {
        Email: detail?.UserInfo?.Email ?? userInfo?.Email ?? '',
        Username: detail?.Username ?? '', 
        Password: detail?.Password ?? '',
        FirstName: firstName ?? detail?.UserInfo?.FirstName ?? '',
        LastName: lastName ?? detail?.UserInfo?.LastName ?? '',
        PictureURL: detail?.UserInfo?.PictureURL ?? userInfo?.PictureURL ?? '',
        GoogleID: detail?.UserInfo?.GoogleID ?? userInfo?.GoogleID ?? '',
        Role: Array.isArray(detail?.Role) ? detail.Role : [],
      };
      console.log('Saving profile with body:', body);
      await axios.patch(`${getBaseURL()}/users/me`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });

      Alert.alert('Saved', 'Your profile was updated.');
      router.back();
    } catch (err: any) {
      console.log('Save error:', err?.response?.data || err?.message || err);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-200">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white font-sans-semibold mt-2.5">Loading…</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="pb-10">
          {/* Header */}
          <View className="bg-primary-200">
            <View className="flex flex-row h-auto items-center p-2.5">
              <Pressable onPress={() => router.back()} className="p-2">
                <MaterialIcons name="arrow-back-ios" size={24} color="white" />
              </Pressable>
              <Text className="text-white font-sans-semibold text-lg leading-6">
                แก้ไขโปรไฟล์
              </Text>
            </View>

            {/* Avatar */}
            <View className="relative w-32 h-32 self-center mt-6 mb-6">
              <Image source={{ uri: userInfo?.PictureURL }} className="w-32 h-32 rounded-full" />
              <Pressable
                onPress={pickAndUploadPicture}
                disabled={uploadingPic}
                className="absolute bottom-1 right-1 h-9 w-9 bg-accent-200 rounded-full items-center justify-center"
              >
                {uploadingPic ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <MaterialIcons name="edit" size={18} color="black" />
                )}
              </Pressable>
            </View>
          </View>

          {/* Form */}
          <View className="px-4 gap-3 mt-4">
            {/* First Name */}
            <View className="gap-1">
              <Text className="text-white/80 font-sans-semibold">ชื่อจริง</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="ใส่ชื่อจริง"
                placeholderTextColor="#BEBFC3"
                className="bg-primary-100 text-white rounded-xl px-4 h-12 font-sans"
              />
            </View>

            {/* Last Name */}
            <View className="gap-1">
              <Text className="text-white/80 font-sans-semibold">นามสกุล</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="ใส่นามสกุล"
                placeholderTextColor="#BEBFC3"
                className="bg-primary-100 text-white rounded-xl px-4 h-12 font-sans"
              />
            </View>

            {/* Email (read-only) */}
            <View className="gap-1">
              <Text className="text-white/80 font-sans-semibold">อีเมล</Text>
              <TextInput
                value={email}
                editable={false}
                selectTextOnFocus={false}
                className="bg-primary-100/60 text-white/80 rounded-xl px-4 h-12 font-sans"
              />
            </View>

            {/* Save button */}
            <Pressable
              onPress={saving ? undefined : handleSave}
              disabled={saving}
              className={`mt-4 rounded-xl h-12 items-center justify-center ${
                saving ? 'bg-accent-200/50' : 'bg-accent-200'
              }`}
            >
              {saving ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-sans-semibold">ยืนยัน</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
