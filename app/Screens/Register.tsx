import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView, // Import KeyboardAvoidingView
  Platform, // Import Platform
  ScrollView, // Import ScrollView
} from "react-native";
import React, { useState } from "react";

// Import necessary items from react-hook-form
import { useForm, Controller, SubmitHandler } from "react-hook-form";

import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useNavigation } from "expo-router";

import axios from "axios";
import { API_BASE_URL } from "../utils/API_URL";
import uuid from 'react-native-uuid';
import { useAuth } from "../AuthContext";
import Toast from "react-native-toast-message";

// Define the type for your form data
type FormData = {
  fullName: string;
  employeeId: string;
  email: string;
  password: string;
  phoneId: string;
};

export default function Register() {
  const navigation = useNavigation();

  const {setAuthData, phoneId} = useAuth();

  const [showPass, setShowPass] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      employeeId: "",
      email: "",
      password: "",
      phoneId: '',
    },
  });


  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const newphoneId = uuid.v4();
  
    try {
      const response = await axios.post(`${API_BASE_URL}/users/check-phone`, {
        phoneId,
      });
  
      if (response.data.exists) {
        // alert("This phone is already connected to another account.");
        Toast.show({
          type: 'info',
          text1: 'One user per device is  allowed.'
        })
        return; 
      }
  
      const registerResponse = await axios.post(`${API_BASE_URL}/users`, {
        ...data,
        phoneId: newphoneId, 
      });
  
      if (registerResponse.status === 201) {
        alert(registerResponse.data.message);
        setAuthData(undefined, undefined, newphoneId);
        navigation.navigate("Login" as never);
      }
    } catch (err: any) {
      console.log(err);
      // alert(err.response?.data?.message || "Something went wrong");
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || "Something went wrong"
      })
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.heading}>
            <Text style={styles.login_head}>Register</Text>
            <Text style={styles.desc}>Please Register to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Feather
                style={styles.iconLeft}
                name="user"
                size={26}
                color={errors.fullName ? "red" : "#1B364C"}
              />
              <Controller
                control={control}
                rules={{
                  required: "Full name is required.",
                  minLength: {
                    value: 3,
                    message: "Full name must be at least 3 characters.",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Full name"
                    style={styles.inputArea}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isSubmitting}
                  />
                )}
                name="fullName"
              />
            </View>
            {errors.fullName && (
              <Text style={styles.errorTextname}>
                {errors.fullName.message}
              </Text>
            )}

            {/* Employee ID Input */}
            <View style={styles.inputWrapper}>
              <AntDesign
                style={styles.iconLeft}
                name="idcard"
                size={24}
                color={errors.employeeId ? "red" : "#1B364C"}
              />
              <Controller
                control={control}
                rules={{
                  required: "Employee ID is required.",
                  pattern: {
                    value: /^[a-zA-Z0-9]+$/,
                    message: "Invalid Employee ID format.",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Employee ID"
                    style={styles.inputArea}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isSubmitting}
                  />
                )}
                name="employeeId"
              />
            </View>
            {errors.employeeId && (
              <Text style={styles.errorTextemp}>
                {errors.employeeId.message}
              </Text>
            )}

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Fontisto
                style={styles.iconLeft}
                name="email"
                size={24}
                color={errors.email ? "red" : "#1B364C"}
              />
              <Controller
                control={control}
                rules={{
                  required: "Email is required.",
                  pattern: {
                    value: /^\S+@\S+$/i,
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
                    editable={!isSubmitting}
                  />
                )}
                name="email"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorTextemail}>{errors.email.message}</Text>
            )}

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <MaterialIcons
                style={styles.iconLeft}
                name="lock-outline"
                size={28}
                color={errors.password ? "red" : "#1B364C"}
              />
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
                    placeholder="Password"
                    style={styles.inputArea}
                    secureTextEntry={!showPass}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isSubmitting}
                  />
                )}
                name="password"
              />

              <Pressable
                style={styles.iconRight}
                onPress={() => setShowPass(!showPass)}
                disabled={isSubmitting}
              >
                <FontAwesome5
                  name={showPass ? "eye" : "eye-slash"}
                  size={22}
                  color="#1B364C"
                />
              </Pressable>
            </View>
            {errors.password && (
              <Text style={styles.errorTextpassword}>
                {errors.password.message}
              </Text>
            )}
          </View>
          {/* --- End Form Inputs --- */}

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
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
                <Text style={styles.submitButtonText}>Sign up</Text>
              )}
            </Pressable>

            {/* Navigation Link */}
            <View style={styles.signInLinkContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Pressable
                disabled={isSubmitting}
                onPress={() => navigation.navigate("Login" as never)}
              >
                <Text style={styles.signInLink}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  heading: {
    width: "100%",
    marginBottom: 25,
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
    color: "#6b7f90",
  },
  form: {
    width: "100%",
    marginBottom: 20,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F5F6F8",
    borderRadius: 100,
    marginBottom: 5,
    marginTop: 15,
    position: "relative",
  },
  inputArea: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 55,
    fontSize: 14,
    color: "#1B364C",
    fontWeight: "500",
    position: "relative",
  },
  passwordInput: {
    paddingRight: 55,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 30,
  },
  iconLeft: {
    position: "absolute",
    left: 20,
    zIndex: 1,
  },
  iconRight: {
    position: "absolute",
    right: 20,
    padding: 5,
    zIndex: 1,
  },
  errorTextname: {
    position: "absolute",
    color: "red",
    fontSize: 12,
    left: 15,
    top: 65,
    zIndex: 100,
  },
  errorTextemp: {
    position: "absolute",
    color: "red",
    fontSize: 12,
    left: 15,
    top: 135,
    zIndex: 10,
  },
  errorTextemail: {
    position: "absolute",
    color: "red",
    fontSize: 12,
    left: 15,
    top: 205,
    zIndex: 10,
  },
  errorTextpassword: {
    position: "absolute",
    color: "red",
    fontSize: 12,
    left: 15,
    top: 275,
    zIndex: 10,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 15, // Gap between button and sign in link
  },
  submitButton: {
    backgroundColor: "#1B364C",
    width: "100%",
    paddingVertical: 16, // Slightly larger padding
    borderRadius: 100,
    alignItems: "center", // Center ActivityIndicator or Text
    justifyContent: "center",
    minHeight: 54, // Ensure consistent height with/without loader
  },
  submitButtonDisabled: {
    backgroundColor: "#a9b4bd", // Style for disabled state
  },
  submitButtonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600", // Use string
    color: "white",
  },
  signInLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the link text
    marginTop: 10, // Add some margin top
  },
  signInText: {
    fontWeight: "500", // Use string
    color: "gray",
    fontSize: 14,
  },
  signInLink: {
    color: "#1B364C",
    fontWeight: "600", // Use string
    fontSize: 14,
    marginLeft: 5, // Space between text and link
  },
});
