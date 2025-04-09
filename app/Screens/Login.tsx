import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

// Import react-hook-form
import { useForm, Controller, SubmitHandler } from "react-hook-form";

import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation } from "expo-router";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { API_BASE_URL } from "../utils/API_URL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

// Define the type for our form data
type FormData = {
  email: string; // Assuming username is email based on placeholder
  password: string;
  phoneId: string;
};

export default function Login() {
  const navigation = useNavigation();

  const { setIsLoggedIn, setAuthData, phoneId } = useAuth();

  const [showPass, setShowPass] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      phoneId: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        ...data,
        phoneId: phoneId,
      });

      if (response.status === 201) {
        console.log(phoneId);
        // alert(response.data.message);
        Toast.show({
          type: "success",
          text1: response.data.message,
        });
        await AsyncStorage.setItem("phoneId", phoneId ?? "");
        setIsLoggedIn(true);
        setAuthData(
          response.data.user.id,
          response.data.user.name,
          phoneId ?? undefined
        );
        navigation.reset({
          index: 0,
          routes: [{ name: "Tabs" as never }],
        });
      }
    } catch (err: any) {
      console.log(err);
      // alert(err.response?.data?.message);
      Toast.show({
        type: "success",
        text1: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={require("../../assets/images/Enter-OTP-bro.png")}
        />

        <View style={styles.heading}>
          <Text style={styles.login_head}>Login</Text>
          <Text style={styles.desc}>Please Signin to continue</Text>
        </View>

        {/* --- Updated Form Section --- */}
        <View style={styles.form}>
          {/* Username/Email Input */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              rules={{
                required: "Email is required.",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address.",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Email"
                  style={styles.inputArea}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              )}
              name="email"
            />
            <Feather
              style={styles.iconLeft}
              name="user"
              size={28}
              color="#1B364C"
            />
            {/* Display validation error */}
            {errors.email && (
              <Text style={styles.errorTextemail}>{errors.email.message}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              rules={{
                required: "Password is required.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters.",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  secureTextEntry={!showPass}
                  placeholder="Password"
                  style={styles.inputArea}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoComplete="password"
                />
              )}
              name="password"
            />
            <MaterialIcons
              style={styles.iconLeft}
              name="lock-outline"
              size={28}
              color="#1B364C"
            />
            {/* Password Visibility Toggle */}
            <Pressable
              style={styles.iconRight}
              onPress={() => setShowPass(!showPass)}
              hitSlop={10}
            >
              <FontAwesome5
                name={showPass ? "eye" : "eye-slash"}
                size={24}
                color="#1B364C"
              />
            </Pressable>
            {errors.password && (
              <Text style={styles.errorTextpassword}>
                {errors.password.message}
              </Text>
            )}
            <Pressable
              onPress={()=>navigation.navigate('security' as never)}
              style={{
                flexDirection: "row",
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: 10
              }}
            >
              <AntDesign name="lock" size={14} color="#1B364C" />
              <Text style={{ color: "#1B364C", fontSize: 12 }}>
                Device security
              </Text>
            </Pressable>
          </View>
        </View>

        {/* --- Submit Button and Signup Link --- */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Sign in</Text>
            )}
          </Pressable>
          <View style={styles.signupLinkContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable
              disabled={isSubmitting}
              onPress={() => navigation.navigate("Register" as never)}
            >
              <Text style={styles.signupLink}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// --- Updated Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  heading: {
    width: "100%",
    marginBottom: 20,
  },
  login_head: {
    fontSize: 32,
    fontWeight: "500",
    color: "#1B364C",
    marginBottom: 5,
  },
  desc: {
    fontSize: 14,
    fontWeight: "500",
    color: "gray",
  },
  form: {
    width: "100%",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
    position: "relative",
    width: "100%",
  },
  inputArea: {
    width: "100%",
    backgroundColor: "#F5F6F8",
    paddingVertical: 14,
    borderRadius: 100,
    paddingLeft: 55,
    paddingRight: 55,
    fontSize: 14,
    color: "#1B364C",
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "#F5F6F8",
  },
  inputError: {
    borderColor: "red",
  },
  iconLeft: {
    position: "absolute",
    left: 18,
    top: 12,
    zIndex: 1,
  },
  iconRight: {
    position: "absolute",
    right: 18,
    top: 12,
    zIndex: 1,
  },
  errorTextemail: {
    color: "red",
    fontSize: 12,
    left: 25,
    top: 45,
    position: "absolute",
    width: "100%",
  },
  errorTextpassword: {
    color: "red",
    fontSize: 12,
    left: 25,
    top: 50,
    position: "absolute",
    width: "100%",
  },

  actionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#1B364C",
    width: "100%",
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    minHeight: 50,
    borderRadius: 100,
  },
  submitButtonDisabled: {
    backgroundColor: "#a0a0a0",
  },
  submitButtonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 5,
  },
  signupLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signupText: {
    fontWeight: "500",
    color: "gray",
    fontSize: 14,
  },
  signupLink: {
    color: "#1B364C",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 5,
  },
});
