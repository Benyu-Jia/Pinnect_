import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import BackButton from "../../components/stack-back-button";
import ListSectionTitle from "./list-section-title";
import {
  ItemClearCache,
  ItemDarkMode,
  ItemEditInterests,
  ItemEditProfile,
  ItemLikedPins,
  ItemLogout
} from "./items";
import { useNavigation } from "@react-navigation/core";

const SettingsScreen = React.memo(() => {
  const profileStack = useNavigation();

  useEffect(() => {
    profileStack.setOptions({
      headerLeft: (props: any) => <BackButton {...props} />
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.topInset} />
        <ListSectionTitle>ACCOUNT</ListSectionTitle>
        <ItemEditProfile />
        <ItemEditInterests />
        <ItemLikedPins />
        <ListSectionTitle>GENERAL</ListSectionTitle>
        <ItemDarkMode />
        <ItemClearCache />
        <ItemLogout />
      </ScrollView>
    </SafeAreaView>
  );
});

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  topInset: {
    marginTop: 8
  }
});
