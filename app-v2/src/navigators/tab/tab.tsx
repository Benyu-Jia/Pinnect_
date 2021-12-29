import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ADIcon from "react-native-vector-icons/AntDesign";
import FeatherIcon from "react-native-vector-icons/Feather";
import IoniconsIcon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/core";

import Home from "../../screens/home/home";
import GradientPlusButton from "./create-button";
import { isIphoneWithNotch } from "../../helpers/utils";
import Context from "../../contexts/global-state";
import ProfileStack from "../profile-stack/profile-stack";
import FriendsStack from "../friends-stack/friends-stack";
import FeedScreen from "../../screens/feed/feed";

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  const GlobalContext = useContext(Context);
  const rootStack = useNavigation();

  return (
    <Tab.Navigator
      tabBarOptions={{
        labelStyle: { height: 0 },
        showLabel: false,
        style: styles.bottomTabBar,
        safeAreaInsets: {
          bottom: isIphoneWithNotch() ? 24 : 0
        },
        activeTintColor: "magenta"
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: (params) => (
            <ADIcon name="home" size={24} color={params.color} />
          )
        }}
      />

      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: (params) => (
            <IoniconsIcon name="aperture" size={24} color={params.color} />
          )
        }}
      />

      <Tab.Screen
        name="CreatePin"
        options={{
          tabBarButton: () => (
            <GradientPlusButton
              onPress={() => {
                if (GlobalContext.state.session == null) {
                  rootStack.navigate("AuthChoiceScreen");
                } else {
                  rootStack.navigate("CreatePinScreen");
                }
              }}
            />
          )
        }}
      >
        {() => null}
      </Tab.Screen>

      <Tab.Screen
        name="Friends"
        component={FriendsStack}
        options={{
          tabBarIcon: (params) => (
            <FeatherIcon name="message-circle" size={24} color={params.color} />
          )
        }}
      />

      <Tab.Screen
        name="Settings"
        component={ProfileStack}
        options={{
          tabBarIcon: (params) => (
            <IoniconsIcon name="person-circle-outline" size={28} color={params.color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTab;

const styles = StyleSheet.create({
  bottomTabBar: {
    justifyContent: "center",
    height: isIphoneWithNotch() ? 88 : 66,
    borderTopWidth: 0,
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0
    }
  }
});
