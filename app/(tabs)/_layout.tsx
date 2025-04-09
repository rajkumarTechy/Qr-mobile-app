import React from "react";
import Home from "./Screens/Home";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Qrscanner from "./Screens/Qrscanner";
import History from "./Screens/History";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { View } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message'

export default function TabLayout() {
  const Tab = createBottomTabNavigator();

  return (
    <>
      <Toast />
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: '#bbb',
        
        tabBarStyle: {
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "600"
        },
        tabBarIconStyle: {
          marginTop: 8
        }
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
        name="Home"
        component={Home}
      />
      <Tab.Screen
        name="Qrscanner"
        component={Qrscanner}
        options={{
          tabBarLabel: () => null, 
          tabBarIcon: () => (
            <View
              style={{
                width: 50,
                height: 50,
                backgroundColor: "#4CAF50", 
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 15
              }}
            >
              <MaterialIcons name="qr-code-scanner" size={24} color="white" />
            </View>
          ),
          
        }}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="clockcircleo" size={24} color={color} />
          ),
          headerShown: true
        }}
        name="History"
        component={History}
      />
    </Tab.Navigator>
    </>
  );
}
