import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "@/app/utils/API_URL";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";

export default function Modal({
  onClose,
  leaveState,
}: {
  onClose: () => void;
  leaveState?: boolean;
}) {
  const { userId } = useAuth();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [disable, setDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<{
    user: { name: string; empId: string };
  } | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const date = new Date().toLocaleDateString();


  const colors = {
    primary: "#007AFF",
    secondary: "#6c757d",
    background: "#FFFFFF",
    textPrimary: "#212529",
    textSecondary: "#6c757d",
    border: "#dee2e6",
    loader: "#28a745",
  };

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  }

  const getUserData = async () => {
    setLoading(true);
    try {
      const resposne = await axios.get(
        `${API_BASE_URL}/attendance/user/${userId}`
      );

      if (resposne.status === 200) {
        setUserData(resposne.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
    {
      !leaveState && getCurrentLocation();
    }
  }, []);

  const isInsideRoomBoundingBox = (latitude: number, longitude: number) => {
    const minLat = 9.470391; // Bottom-left latitude (Smaller value)
    const maxLat = 9.470448; // Top-right latitude (Larger value)
    const minLng = 77.770850; // Bottom-left longitude
    const maxLng = 77.771160; // Top-right longitude

    return (
      latitude >= minLat &&
      latitude <= maxLat &&
      longitude >= minLng &&
      longitude <= maxLng
    );
  };

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    const { latitude, longitude } = location.coords;


    if (isInsideRoomBoundingBox(latitude, longitude)) {
      text = "✅ Verified";
    } else {
      text = "❌ Invalid";
    }
  }

  const handleAttendance = async () => {
    console.log("Executing...");
    setSubmitting(true);
    if (leaveState) {
      try {
        const res = await axios.get(`${API_BASE_URL}/attendance/${userId}`);
        const leave = res.data;

        if (leave) {
          if (leave.isCheckedOut) {
            Toast.show({
              type: "info",
              text1: "Today's attendance is already completed",
            });
            return;
          } else {
            Toast.show({
              type: "info",
              text1: "You're already CheckedIn",
            });
          }
        } else {
          await axios.post(`${API_BASE_URL}/attendance/leave/${userId}`);
          Toast.show({
            type: "success",
            text1: "Leave Applied Successfully",
          });
        }
      } catch (Err: any) {
        console.log(Err);
        Toast.show({
          type: "error",
          text1: Err.response?.data?.message || "Something went wrong",
        });
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        const res = await axios.get(`${API_BASE_URL}/attendance/${userId}`);
        const attendance = res.data;

        if (attendance) {
          if (attendance.isCheckedOut) {
            Toast.show({
              type: "info",
              text1: "Today's attendance is already completed",
            });
            return;
          }

          if (attendance.isCheckedIn && !attendance.isCheckedOut) {
            await axios.put(`${API_BASE_URL}/attendance/check-out/${userId}`);
            Toast.show({
              type: "success",
              text1: "Check-Out Successful!",
            });
            // onClose();
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: "Home" as never }],
            // });
            setDisable(true)
          }
        } else {
          await axios.post(`${API_BASE_URL}/attendance/check-in/${userId}`);
          Toast.show({
            type: "success",
            text1: "Check-In Successful!",
          });
          // onClose();
          // navigation.reset({
          //   index: 0,
          //   routes: [{ name: "Home" as never }],
          // });
          setDisable(true)
        }
      } catch (err: any) {
        console.log(err);
        Toast.show({
          type: "error",
          text1: err.response?.data?.message || "Something went wrong",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  useEffect(() => {
  if (leaveState) {
    setDisable(false); // Allow confirming leave
  } else if (location) {
    const { latitude, longitude } = location.coords;

    if (isInsideRoomBoundingBox(latitude, longitude)) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }
}, [location, leaveState]);

  

  return (
    <>
      <View style={[styles.modalContainer, { width: screenWidth }]}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.loader} />
          </View>
        ) : userData ? (
          <>
            <Text
              style={{ textAlign: "center", fontSize: 24, fontWeight: 800 }}
            >
              {leaveState ? "Register Your Leave" : "Register Your Attendance"}
            </Text>
            <View style={styles.contentArea}>
              <View>
                <Text style={styles.nameText}>
                  {userData.user?.name || "N/A"}
                </Text>
                <Text style={styles.detailText}>
                  Employee ID: {userData.user?.empId || "N/A"}
                </Text>
                <Text style={styles.detailText}>Date : {date}</Text>
                {!leaveState && (
                  <Text style={styles.detailText}>Location:{text}</Text>
                )}
              </View>
              <Image
                style={{ width: 70, height: 70 }}
                source={require("../../../assets/images/icon-person.png")}
              />
            </View>

            <View style={styles.actionsArea}>
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Close
                </Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.primaryButton,
                  disable && styles.conformButtomDisabled]}
                disabled={disable}
                onPress={handleAttendance}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={"white"} />
                ) : (
                  <Text
                    style={[
                      styles.buttonText,
                      styles.primaryButtonText
                    ]}
                  >
                    Confirm
                  </Text>
                )}
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.centerContent}>
            <Text style={styles.detailText}>No Employee Data Found</Text>
          </View>
        )}
      </View>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    height: 285,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 15,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 8,
    display: "flex",
    flexDirection: "column",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentArea: {
    flex: 1,
    marginVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 6,
    lineHeight: 22,
  },
  actionsArea: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#28a745",
  },
  secondaryButton: {
    backgroundColor: "red",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
  },
  conformButtomDisabled: {
    backgroundColor: "#a0a0a0",
  },
});
