import { useNavigation } from "@react-navigation/core";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBar
} from "@react-navigation/material-top-tabs";
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/AntDesign";
import AppFontFamily from "../../constants/fonts";
import Discover from "./discover";
import MomentsScreen from "./moments";
import RecommendPage from "./recommend/recommend";
import SearchPinScreen from "./search-pin";

const Tab = createMaterialTopTabNavigator();

const FeedScreen = () => {
  const safeArea = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBar={(props) => (
          <View style={{ paddingTop: safeArea.top }}>
            <MaterialTopTabBar {...props} />
          </View>
        )}
        tabBarOptions={{ labelStyle: styles.tabLabel }}
      >
        <Tab.Screen name="DiscoverPage" component={Discover} options={{ title: "Trending" }} />
        <Tab.Screen name="RecommendPage" component={RecommendPage} options={{ title: "For You" }} />
        <Tab.Screen name="Moments" component={MomentsScreen} options={{ title: "Moments" }} />
        <Tab.Screen
          name="SearchPinScreen"
          component={SearchPinScreen}
          options={{
            title: "Search"
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  tabLabel: {
    fontFamily: AppFontFamily.BOLD,
    fontSize: 14,
    margin: 0,
    textTransform: "none"
  }
});
