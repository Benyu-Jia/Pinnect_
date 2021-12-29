import React from "react";
import { StyleSheet, View, Platform, StatusBar } from "react-native";
import FlashMessage from "react-native-flash-message";

import MyNavigator from "./src/screens/stack-navigator";
import FriendHome from "./src/screens/friends/home";
export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MyNavigator />
      <FlashMessage
        position="top"
        duration={6000}
        floating={true}
        titleStyle={styles.flashMessageTitle}
        textStyle={styles.flashMessageText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  flashMessageTitle: {
    fontFamily: "Roboto-Bold"
  },
  flashMessageText: {
    fontFamily: "Roboto-Regular"
  }
});
