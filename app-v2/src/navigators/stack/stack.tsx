import React from "react";
import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

import BackButton from "../../components/stack-back-button";
import AppText from "../../components/app-text";
import BottomTab from "../tab/tab";
import LoginScreen from "../../screens/auth/login";
import AuthChoiceScreen from "../../screens/auth/auth-choice";
import CreatePinScreen from "../../screens/home/create-pin";
import RegisterScreen1 from "../../screens/auth/register-1";
import RegisterScreen2 from "../../screens/auth/register-2";
import ForgetPasswordScreen from "../../screens/auth/forget-password";
import AddFriendsScreen from "../../screens/friends/add-friends";
import InitialInterestsScreeen from "../../screens/interests/initial-interest-screen";
import EditInterestsScreen from "../../screens/interests/edit-interest-screen";

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTitle: (props) => (
          <AppText style={styles.screenHeaderTitle}>{props.children}</AppText>
        ),
        headerLeft: (props) => <BackButton {...props} />
      }}
    >
      <Stack.Screen name="TabNavigator" component={BottomTab} />
      <Stack.Screen name="AuthChoiceScreen" component={AuthChoiceScreen} />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ title: "Log in", headerShown: true }}
      />
      <Stack.Screen
        name="ForgetPasswordScreen"
        component={ForgetPasswordScreen}
        options={{ title: "Forget Password", headerShown: true }}
      />
      <Stack.Screen
        name="RegisterScreen1"
        component={RegisterScreen1}
        options={{ title: "Register", headerShown: true }}
      />
      <Stack.Screen
        name="RegisterScreen2"
        component={RegisterScreen2}
        options={{ title: "Register", headerShown: true }}
      />
      <Stack.Screen
        name="InitialInterestsScreen"
        component={InitialInterestsScreeen}
        options={{ title: "Declare My Interests", headerShown: false }}
      />
      <Stack.Screen
        name="EditInterestsScreen"
        component={EditInterestsScreen}
        options={{ title: "Edit My Interests", headerShown: true }}
      />
      <Stack.Screen
        name="CreatePinScreen"
        component={CreatePinScreen}
        options={{ title: "", headerShown: true }}
      />
      <Stack.Screen
        name="AddFriendsScreen"
        component={AddFriendsScreen}
        options={{ title: "Add Friends", headerShown: true }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  screenHeaderTitle: {
    fontWeight: "bold",
    fontSize: 17
  }
});
