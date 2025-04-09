import { View, Button, Text, Pressable } from "react-native";
import React from "react";
import { useNavigation } from "expo-router";

export default function Login() {

    const natigation = useNavigation();
  return (
    <View>
      <View className="justify-center items-center h-20 w-20 ">
        <Pressable onPress={()=>natigation.navigate('Register' as never)} className="uppercase" >
            <Text>
        Welcome</Text></Pressable>
      </View>
    </View>
  );
}
