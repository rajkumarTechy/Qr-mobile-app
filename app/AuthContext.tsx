import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "./utils/API_URL";

interface AuthProps {
  loading: boolean;
  isLoggedIn: boolean;
  userId: string | null;
  fullName: string | null;
  phoneId: string | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setAuthData: (userId?: string, fullName?: string, phoneId?: string) => void;
}

const AuthContext = createContext<AuthProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default function AuthProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [phoneId, setPhoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setIsLoggedIn = async (value: boolean) => {
    setIsLoggedInState(value);
    await AsyncStorage.setItem("isLoggedIn", JSON.stringify(value));
  };

  const setAuthData = async (
    userId?: string,
    fullName?: string,
    phoneId?: string
  ) => {
    setUserId(userId || null);
    setFullName(fullName || null);
    setPhoneId(phoneId || null);

    if (userId) await AsyncStorage.setItem("userId", userId);
    if (fullName) await AsyncStorage.setItem("fullName", fullName);
    if (phoneId) await AsyncStorage.setItem("phoneId", phoneId);
  };

  const ValidatePhoneId = async (userId: string, phoneId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/auth/check-phoneId`, {
      userId,
      phoneId,
    });

    if (response.data) {
      console.log("Phone ID exists in the backend:", response.data);
      return true;
    } else {
      console.log("Phone ID not found in the backend");
      return false;
    }
  } catch (error) {
    console.error("Error checking phoneId:", error);
    return false;
  }
};


  useEffect(() => {
    const loadAuthState = async () => {
      const storedIsLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedFullName = await AsyncStorage.getItem("fullName");
      const storedPhoneId = await AsyncStorage.getItem("phoneId");

      if (storedIsLoggedIn !== null) {
        setIsLoggedInState(JSON.parse(storedIsLoggedIn));
      }
      if (storedUserId) {
        setUserId(storedUserId);
      }
      if (storedFullName) {
        setFullName(storedFullName);
      }
      if (storedPhoneId) {
        setPhoneId(storedPhoneId);
      }

      const exists = storedUserId && storedPhoneId 
        ? await ValidatePhoneId(storedUserId, storedPhoneId) 
        : false;
      if(!exists) {
        console.warn("Invalid phoneId detected. Logging out.");
        await AsyncStorage.clear();
        setIsLoggedInState(false);
        setUserId(null);
        setFullName(null);
        setPhoneId(null);
      }

      setLoading(false);
    };
    loadAuthState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userId,
        fullName,
        phoneId,
        setIsLoggedIn,
        setAuthData,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
