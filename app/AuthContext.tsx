import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
