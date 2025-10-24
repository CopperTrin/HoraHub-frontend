import React, { useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, LocaleConfig, DateObject } from "react-native-calendars";

// ----- Thai locale -----
LocaleConfig.locales.th = {
  monthNames: ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],
  monthNamesShort: ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],
  dayNames: ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"],
  dayNamesShort: ["อ","จ","อ","พ","พฤ","ศ","ส"],
  today: "วันนี้",
};
LocaleConfig.defaultLocale = "th";

// ----- helpers -----
const toThaiDisplay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2,"0")} / ${String(m).padStart(2,"0")} / ${y + 543}`;
};
const monthThaiBE = (date: Date) =>
  `${String(date.getMonth()+1).padStart(2,"0")} / ${date.getFullYear()+543}`;

type BookingModalProps = {
  visible: boolean;
  onClose: () => void;
  // ส่งกลับวันที่แบบไทย (DD / MM / YYYY พ.ศ.) และ time = "" (ค่าว่าง)
  onSelect: (date: string, time: string) => void;
  // เริ่มต้นที่วันไหน (ถ้าไม่ส่งมา จะเป็นวันนี้)
  initialDateISO?: string; // รูปแบบ YYYY-MM-DD
};

export default function BookingModal({
  visible,
  onClose,
  onSelect,
  initialDateISO,
}: BookingModalProps) {
  // default ISO วันนี้
  const todayISO = new Date().toISOString().slice(0, 10);
  const [selectedISO, setSelectedISO] = useState(initialDateISO ?? todayISO);
  const [showCalendar, setShowCalendar] = useState(true);

  const markedDates = useMemo(
    () => ({
      [selectedISO]: {
        selected: true,
        selectedColor: "#E7D3A3",
        selectedTextColor: "#1E1A2E",
      },
    }),
    [selectedISO]
  );

  const onDayPress = (day: DateObject) => setSelectedISO(day.dateString);

  const handleConfirm = () => {
    const dateDisplay = toThaiDisplay(selectedISO);
    onSelect(dateDisplay, ""); // เวลาเป็นค่าว่าง
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>เลือกวันที่</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Selected date (toggle calendar) */}
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
                renderHeader={(d) => (
                  <Text style={styles.calHeader}>{monthThaiBE(d as unknown as Date)}</Text>
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

          {/* Confirm button */}
          <TouchableOpacity onPress={handleConfirm} activeOpacity={0.9} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>ยืนยันวันที่</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 16 },
  container: { backgroundColor: "#1E1A2E", borderRadius: 16, width: "100%", maxHeight: "88%", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", color: "#FFD33D" },
  close: { fontSize: 20, color: "#fff" },
  dateBox: { backgroundColor: "#9b5de5", borderRadius: 12, paddingVertical: 10, alignItems: "center", marginBottom: 12 },
  dateText: { fontSize: 16, color: "#E9E7EF", fontWeight: "600" },
  calendarWrapper: { backgroundColor: "#151322", borderRadius: 16, padding: 10, marginBottom: 12 },
  calendar: { backgroundColor: "transparent", borderRadius: 12 },
  calHeader: { color: "#E7D3A3", fontWeight: "700", textAlign: "center", fontSize: 16, paddingVertical: 6 },
  confirmBtn: { backgroundColor: "#9b5de5", paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  confirmText: { textAlign: "center", color: "#fff", fontWeight: "700" },
});
