import React from "react";
import { StyleSheet, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

import AppText from "../../components/app-text";
import SettingsScreen from "../../screens/settings/settings";
import ProfileScreen from "../../screens/profile/profile";
import EditProfileScreen from "../../screens/profile/edit-profile";
import LikedPinsScreen from "../../screens/settings/liked-pins/liked-pins";
import EditInterestsScreen from "../../screens/interests/edit-interest-screen";

const Stack = createStackNavigator();

const ProfileStack = React.memo(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTitle: (props) => (
          <AppText style={styles.screenHeaderTitle}>{props.children}</AppText>
        )
      }}
      // The back button is defined in child screens.
      // However, this is inconsistent because previously the back button is rendered here.
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: "", headerShown: true }}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{ title: "Edit Profile", headerShown: true }}
      />
      <Stack.Screen
        name="LikedPinsScreen"
        component={LikedPinsScreen}
        options={{ title: "My Liked Pins", headerShown: true }}
      />
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: "Settings", headerShown: true }}
      />
    </Stack.Navigator>
  );
});

export default ProfileStack;

const styles = StyleSheet.create({
  screenHeaderTitle: {
    fontWeight: "bold",
    fontSize: 17
  }
});
