import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig, DateObject } from "react-native-calendars";

LocaleConfig.locales.th = {
  monthNames: [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ],
  monthNamesShort: [
    "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
    "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",
  ],
  dayNames: [
    "อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์",
  ],
  dayNamesShort: ["อ", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
  today: "วันนี้",
};
LocaleConfig.defaultLocale = "th";

const toISO = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const toThaiDisplay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const be = y + 543;
  return `${String(d).padStart(2, "0")} / ${String(m).padStart(2, "0")} / ${be}`;
};

const monthThaiBE = (date: Date) => {
  const m = date.getMonth() + 1;
  const y = date.getFullYear() + 543;
  return `${String(m).padStart(2, "0")} / ${y}`;
};

// ---------- Props ----------
type BookingModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string, time: string) => void; // date = "DD / MM / YYYY(พ.ศ.)"
};

// ---------- Data ----------
const availableTimes = [
  ["18:20", "18:40", "19:00"],
  ["19:20", "19:40", "20:00"],
  ["20:20", "20:40", "21:00"],
  ["21:20", "21:40", "22:00"],
];

export default function BookingModal({
  visible,
  onClose,
  onSelect,
}: BookingModalProps) {
  // default ให้เป็น 2025-09-12 (ตามภาพ 12/09/2568)
  const [selectedISO, setSelectedISO] = useState("2025-09-12");
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const markedDates = useMemo(
    () => ({
      [selectedISO]: {
        selected: true,
        selectedColor: "#E7D3A3", // ทองอ่อน
        selectedTextColor: "#1E1A2E",
      },
    }),
    [selectedISO]
  );

  const onDayPress = (day: DateObject) => {
    setSelectedISO(day.dateString);   // YYYY-MM-DD
  };

  const handleBooking = () => {
    if (!selectedTime) return;
    onSelect(toThaiDisplay(selectedISO), selectedTime);
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>เลือกเวลาที่ต้องการจอง</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Selected date display + toggle calendar */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dateBox}
            onPress={() => setShowCalendar((s) => !s)}
          >
            <Text style={styles.dateText}>{toThaiDisplay(selectedISO)}</Text>
          </TouchableOpacity>

          {/* Calendar */}
          {showCalendar && (
            <View style={styles.calendarWrapper}>
              <Calendar
                initialDate={selectedISO}
                onDayPress={onDayPress}
                markedDates={markedDates}
                renderArrow={(direction) => (
                  <Text style={{ color: "#E7D3A3", fontSize: 18 }}>
                    {direction === "left" ? "‹" : "›"}
                  </Text>
                )}
                renderHeader={(date) => (
                  <Text style={styles.calHeader}>{monthThaiBE(date as Date)}</Text>
                )}
                theme={{
                  calendarBackground: "#151322",
                  textSectionTitleColor: "#6F6B7E",
                  selectedDayBackgroundColor: "#E7D3A3",
                  selectedDayTextColor: "#1E1A2E",
                  dayTextColor: "#FFFFFF",
                  monthTextColor: "#E7D3A3",
                  arrowColor: "#E7D3A3",
                  textDisabledColor: "#3B3748",
                  todayTextColor: "#9b5de5",
                }}
                style={styles.calendar}
              />
            </View>
          )}

          {/* Time slots */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {availableTimes.map((row, idx) => (
              <View key={idx} style={styles.row}>
                {row.map((t) => {
                  const selected = selectedTime === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.timeBox, selected && styles.timeBoxSelected]}
                      onPress={() => setSelectedTime(t)}
                    >
                      <Text
                        style={[styles.timeText, selected && styles.timeTextSelected]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            {/* last spacer */}
            <View style={{ height: 8 }} />
          </ScrollView>

          {/* Booking Button */}
          <TouchableOpacity
            style={[styles.bookingBtn, !selectedTime && { opacity: 0.6 }]}
            disabled={!selectedTime}
            onPress={handleBooking}
          >
            <Text style={styles.bookingText}>Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#1E1A2E",
    borderRadius: 16,
    width: "100%",
    maxHeight: "88%",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#FFD33D" },
  close: { fontSize: 20, color: "#fff" },

  dateBox: {
    backgroundColor: "#9b5de5",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#E9E7EF",
    fontWeight: "600",
  },

  calendarWrapper: {
    backgroundColor: "#151322",
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  calendar: {
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  calHeader: {
    color: "#E7D3A3",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
    paddingVertical: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeBox: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    minWidth: 86,
    alignItems: "center",
  },
  timeText: { color: "#1E1A2E", fontWeight: "700" },
  timeBoxSelected: {
    backgroundColor: "#E7D3A3", // ทองอ่อน เหมือนปุ่ม 19:00 ในภาพ
  },
  timeTextSelected: {
    color: "#1E1A2E",
  },

  bookingBtn: {
    backgroundColor: "#9b5de5",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  bookingText: { textAlign: "center", color: "#fff", fontWeight: "700" },
});
