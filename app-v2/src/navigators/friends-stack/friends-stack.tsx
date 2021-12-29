import React from "react";
import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

import AppText from "../../components/app-text";
import FriendsScreen from "../../screens/friends/friends";
import ChatScreen from "../../screens/friends/chat";

const Stack = createStackNavigator();

const FriendsStack = React.memo(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTitle: (props) => (
          <AppText style={styles.screenHeaderTitle}>{props.children}</AppText>
        )
      }}
      mode="card"
      initialRouteName="FriendsScreen"
    >
      <Stack.Screen
        name="FriendsScreen"
        component={FriendsScreen}
        options={{ title: "Friends", headerShown: true }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: "", headerShown: true }}
      />
    </Stack.Navigator>
  );
});

export default FriendsStack;

const styles = StyleSheet.create({
  screenHeaderTitle: {
    fontWeight: "bold",
    fontSize: 17
  }
});
