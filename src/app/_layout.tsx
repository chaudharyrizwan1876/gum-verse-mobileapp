import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function Layout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#050505" },
        }}
      />
    </>
  );
}
