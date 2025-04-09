import { View, Text, Pressable, Image, Modal } from "react-native";
import React, { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "expo-router";
import { useAuth } from "@/app/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Model from "./Model";

export default function Home() {
  const navigation = useNavigation();

  const { setIsLoggedIn, fullName, phoneId, setAuthData } = useAuth();
  const [model, setModel] = useState(false);
  const [isLeave, setIsLeave] = useState(false);
  const [btnloading, setBtnLoading] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.setItem("phoneId", phoneId ?? "");
    setIsLoggedIn(false);
    setAuthData(undefined, undefined, phoneId ?? undefined);

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" as never }],
    });
  };

  const handleLeave = () => {
    setModel(true);
    setIsLeave(true)
  };

  return (
    <View>
      <View
        style={{
          width: "100%",
          height: 260,
          backgroundColor: "#001E53",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: 60,
            justifyContent: "space-between",
            width: "80%",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../../assets/images/icon-person.png")}
            />
            <Text style={{ color: "white" }}>{fullName}</Text>
          </View>
          <Pressable onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="white" />
          </Pressable>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "white", fontSize: 12 }}>
            Timely attendance management for every Team!
          </Text>
          <Text style={{ color: "white", fontSize: 20, fontWeight: 600 }}>
            Attendance Made Easy
          </Text>
        </View>
        <Image
          style={{ width: "100%", height: 40 }}
          source={{
            uri: "https://qutalent.org/media/filer_public_thumbnails/filer_public/c7/55/c75538d8-5991-4e7b-aeb6-e6c0e14c2ba7/investor_banner.png__1140x400_crop_subsampling-2_upscale.png",
          }}
        />
      </View>
      <View
        style={{
          marginHorizontal: 12,
          marginVertical: 65,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 600, fontStyle: "italic" }}>
          Feeling Sick!
        </Text>
        <Text style={{ fontSize: 12 }}>Take a Leave and rest in home!</Text>
        <Image
          style={{ width: 200, height: 200 }}
          source={require("../../../assets/images/sick.png")}
        />
        <Pressable
          style={{
            borderRadius: 5,
            backgroundColor: "red",
            marginVertical: 15,
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}
          onPress={handleLeave}
        >
          <Text style={{ color: "white", fontWeight: 800 }}>I'm Leave</Text>
        </Pressable>
      </View>

      <Modal
        visible={model}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModel(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <Model
            onClose={() => {
              setModel(false);
              setIsLeave(false);
            }}
            leaveState={isLeave}
          />
        </View>
      </Modal>
    </View>
  );
}
