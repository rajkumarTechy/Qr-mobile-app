import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  FlatList,
  Modal,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/utils/API_URL";
import { useAuth } from "@/app/AuthContext";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Toast from "react-native-toast-message";

interface AttendanceProps {
  _id: string;
  date: string; // in dd/mm/yyyy format
  status: string;
  checkInTime: string;
  checkOutTime: string;
}

export default function History() {
  const { userId } = useAuth();
  const screenWidth = Dimensions.get("window").width;

  const [loading, setLoading] = useState(false);
  const [Attendance, setAttendance] = useState<AttendanceProps[]>([]);
  const [Filteration, setFilteration] = useState<AttendanceProps[]>([]);
  const [statusFill, setStatusFill] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [filterDates, setFilterDates] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<
    "startDate" | "endDate" | null
  >(null);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await getUserAttendanceDetails();
    } catch (err) {
      console.log("Refresh error", err);
    } finally {
      setRefreshing(false);
    }
  }, []);
  

  useEffect(() => {
    getUserAttendanceDetails();
  }, []);

  const getUserAttendanceDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/attendance/usersAttendance/${userId}`
      );
      if (res.status === 200) {
        setAttendance(res.data);
        setFilteration(res.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return "#4CAF50";
      case "leave":
        return "#F44336";
      case "checkedin":
        return "#FFC107";
      default:
        return "#9E9E9E";
    }
  };

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleFilter = () => {
    setBtnLoading(true);
    let filtered = Attendance;

    if (!filterDates.startDate && !filterDates.endDate && !statusFill) {
      // alert("Please select any of the fields");
      Toast.show({
        type: 'info',
        text1: 'Please select any of the fields'
      })
      setBtnLoading(false);
      return;
    }

    if (statusFill && statusFill !== "select") {
      filtered = filtered.filter(
        (record) => record.status.toLowerCase() === statusFill.toLowerCase()
      );
    }

    if (filterDates.startDate || filterDates.endDate) {
      filtered = filtered.filter((record) => {
        const recordDate = parseDate(record.date);
        recordDate.setHours(0, 0, 0, 0); // normalize time
    
        const startDate = filterDates.startDate
          ? new Date(filterDates.startDate)
          : null;
        const endDate = filterDates.endDate
          ? new Date(filterDates.endDate)
          : null;
    
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(0, 0, 0, 0);
    
        if (
          startDate &&
          endDate &&
          startDate.getTime() === endDate.getTime()
        ) {
          return recordDate.getTime() === startDate.getTime();
        }
    
        const afterStart = startDate ? recordDate >= startDate : true;
        const beforeEnd = endDate ? recordDate <= endDate : true;
    
        return afterStart && beforeEnd;
      });
    }
    
  

    setFilteration(filtered);
    setBtnLoading(false);
    setShowFilterModel(false);
  };

  const handleReset = () => {
    setBtnLoading(true);
    setStatusFill("");
    setFilterDates({ startDate: null, endDate: null });
    setFilteration(Attendance);
    setBtnLoading(false);
    setShowFilterModel(false);
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
        <View style={{ marginHorizontal: 12, marginTop: 10 }}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Pressable
              onPress={() => setShowFilterModel(true)}
              style={{
                flexDirection: "row",
                gap: 5,
                paddingVertical: 5,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 100,
                borderColor: "#bbb",
                alignItems: "center",
              }}
            >
              <FontAwesome name="sliders" size={14} color="black" />
              <Text style={{ fontSize: 12 }}>Filter</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ marginHorizontal: 12, marginTop: 15, gap: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : Filteration.length === 0 ? (
            <View
              style={{
                flex: 1,
                backgroundColor: "red",
                marginTop: 180,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                style={{ height: 300, width: 300 }}
                source={require("../../../assets/images/nodata.png")}
              />
            </View>
          ) : (
            <FlatList
              data={Filteration}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ gap: 10 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
              }
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: "white",
                    padding: 10,
                    borderRadius: 10,
                    borderLeftWidth: 5,
                    borderLeftColor: getStatusColor(item.status),
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 24, paddingVertical: 8 }}>
                      {item.date}
                    </Text>
                    <Text
                      style={[
                        styles.glowText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      <View
                        style={[
                          styles.glowDot,
                          { backgroundColor: getStatusColor(item.status) },
                        ]}
                      />{" "}
                      {item.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, paddingVertical: 5 }}>
                    Check-in-time : {item.checkInTime}
                  </Text>
                  <Text style={{ fontSize: 12, paddingVertical: 5 }}>
                    Check-out-time : {item.checkOutTime || "Not updated"}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>






      {/* <===========================Separate Model (Filter)==============================> */}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModel}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowFilterModel(false);
          setShowDatePicker(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: screenWidth,
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              gap: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable onPress={handleReset}>
                <Text style={{ fontSize: 15 }}>Clear Filters</Text>
              </Pressable>
            </View>

            {/* From Date */}
            <View>
              <Text style={{ padding: 5, fontSize: 16 }}>From</Text>
              <Pressable
                onPress={() => {
                  setActiveDateField("startDate");
                  setShowDatePicker(true);
                }}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 5,
                  padding: 15,
                }}
              >
                <Text>
                  {filterDates.startDate
                    ? filterDates.startDate.toLocaleDateString()
                    : "dd/mm/yyyy"}
                </Text>
                <EvilIcons name="chevron-down" size={24} color="black" />
              </Pressable>
            </View>

            {/* To Date */}
            <View>
              <Text style={{ padding: 5, fontSize: 16 }}>To</Text>
              <Pressable
                onPress={() => {
                  setActiveDateField("endDate");
                  setShowDatePicker(true);
                }}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 5,
                  padding: 15,
                }}
              >
                <Text>
                  {filterDates.endDate
                    ? filterDates.endDate.toLocaleDateString()
                    : "dd/mm/yyyy"}
                </Text>
                <EvilIcons name="chevron-down" size={24} color="black" />
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                mode="date"
                display="default"
                value={filterDates[activeDateField!] || new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (event.type === "set" && selectedDate) {
                    setFilterDates((prev) => ({
                      ...prev,
                      [activeDateField!]: selectedDate,
                    }));
                  }
                }}
              />
            )}

            {/* Status Filter */}
            <View
              style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 5 }}
            >
              <Picker
                selectedValue={statusFill}
                onValueChange={(itemValue) => setStatusFill(itemValue)}
              >
                <Picker.Item label="Select Status" value="select" />
                <Picker.Item label="Present" value="Present" />
                <Picker.Item label="CheckedIn" value="CheckedIn" />
                <Picker.Item label="Leave" value="Leave" />
              </Picker>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable
                style={{
                  backgroundColor: "#1E90FF",
                  paddingVertical: 15,
                  borderRadius: 5,
                  paddingHorizontal: 35,
                }}
                onPress={handleFilter}
              >
                {btnLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    Apply
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
        <Toast />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  glowDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  glowText: {
    fontSize: 12,
    fontWeight: "bold",
    flexDirection: "row",
    alignItems: "center",
  },
});
