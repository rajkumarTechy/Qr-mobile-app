import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Button, Pressable, StyleSheet, Text, View, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import { API_BASE_URL } from "@/app/utils/API_URL";
import Model from "./Model";
import Toast from "react-native-toast-message";

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [model, setModel] = useState(false);
  const [cameraOn, setCameraOn] = useState(true); 

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const qrValidation = async (data: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/attendance`, data);
      if (response.status === 201) {
        setModel(true);
        setCameraOn(false); 
      }
    } catch (err: any) {
      console.log(err);
      // alert(err.response?.data?.message);
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message
      })
    }
  };

  const handleBarcodeScanned = ({ data }: {data: string}) => {
    setScanned(true);
    qrValidation(data);
  };

  return (
    <View style={styles.container}>
      {cameraOn && (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
          style={styles.camera}
          facing={facing}
        />
      )}

      {scanned && (
        <View style={styles.reloadButton}>
          <Pressable onPress={() => setScanned(false)}>
            <Ionicons name="reload" size={32} color="white" />
          </Pressable>
        </View>
      )}

      {/* ✅ Modal for QR Code Success */}
      <Modal
        visible={model}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModel(false);
          setCameraOn(true); 
        }}
      >
        <View style={styles.modalContainer}>
          <Model onClose={() => {
            setModel(false);
            setCameraOn(true); 
          }} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    height: 350,
    width: 350,
    borderRadius: 25,
  },
  reloadButton: {
    backgroundColor: "green",
    margin: 20,
    padding: 15,
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
