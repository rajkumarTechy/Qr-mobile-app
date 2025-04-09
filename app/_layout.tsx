import { ActivityIndicator, SafeAreaView, StatusBar, ToastAndroid, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "./global.css";
import Toast from 'react-native-toast-message'

import TabLayout from "./(Tabs)/_layout";
import Register from "./Screens/Register";
import Login from "./Screens/Login";
import AuthProvider, { useAuth } from "./AuthContext";
import App from "./(Tabs)/Screens/Location";
import Security from "./(Tabs)/Screens/Security";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1B364C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar
        translucent
        backgroundColor={"white"}
        barStyle={"dark-content"}
      />
      <AuthProvider>
        <Stack.Navigator
          initialRouteName={isLoggedIn ? "Tabs" : "Login"}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Tabs" component={TabLayout} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen options={{headerShown: true}} name="security" component={Security}/>
        </Stack.Navigator>
      </AuthProvider>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
      <Toast />
    </AuthProvider>
  );
}
