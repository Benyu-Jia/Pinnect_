import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { showMessage } from "react-native-flash-message";
import { useNavigation } from "@react-navigation/core";

import AppText from "../../../components/app-text";
import { fetchAPI } from "../../../helpers/fetch";
import Context from "../../../contexts/global-state";
import LikedPinsList from "./liked-pins-list";
import BackButton from "../../../components/stack-back-button";
import { MaterialIndicator } from "react-native-indicators";

const LikedPinsScreen = () => {
  const GlobalState = useContext(Context);
  const profileStack = useNavigation();
  const [likedPins, setLikedPins] = useState<any | null>(null);

  useEffect(() => {
    profileStack.setOptions({
      headerLeft: (props: any) => <BackButton {...props} />
    });
  }, []);

  useEffect(() => {
    async function loadLikedPins() {
      const result = await fetchAPI("get_liked_pins", "POST", {
        session: GlobalState.state.session
      });
      if (result.data.error != 0) {
        showMessage({ message: result.data.message, type: "danger" });
        return;
      }
      console.log(result.data);
      setLikedPins(result.data);
    }

    if (GlobalState.state.session != null) {
      loadLikedPins();
    }
  }, []);

  const renderLikedList = () => {
    if (likedPins == null) {
      return <MaterialIndicator color="gray" />;
    }

    if (likedPins.pins.length > 0) {
      return <LikedPinsList data={likedPins} />;
    } else {
      return (
        <SafeAreaView style={styles.noPinTextContainer}>
          <AppText style={styles.noPintext}>
            You haven't liked any pins.
          </AppText>
        </SafeAreaView>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>{renderLikedList()}</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    backgroundColor: "white",
    flex: 1
  },
  noPintext: {
    color: "gray",
    margin: 32
  },
  noPinTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default LikedPinsScreen;
