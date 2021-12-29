import React, { useCallback, useContext, useEffect, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import * as Font from "expo-font";
import FlashMessage from "react-native-flash-message";
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import Spinner from "react-native-loading-spinner-overlay";
import { io } from "socket.io-client";

import AppStack from "./navigators/stack/stack";
import AppFontFamily from "./constants/fonts";
import Context, { GlobalStateType } from "./contexts/global-state";
import { API_BASE } from "./helpers/fetch";
import { SkypeIndicator } from "react-native-indicators";

enableScreens(true);

const Pinnect = () => {
  const GlobalState = useContext(Context);

  const [fontLoaded, setFontLoaded] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  useEffect(() => {
    Font.loadAsync({
      "ProximaNova-Regular": require("../assets/fonts/ProximaNova-Regular.ttf"),
      "ProximaNova-Bold": require("../assets/fonts/ProximaNova-Bold.ttf"),
      "Comfortaa-Regular": require("../assets/fonts/Comfortaa-Regular.ttf")
    }).then(() => setFontLoaded(true));
  }, []);

  useEffect(() => {
    if (GlobalState.state.socketClient == null) {
      const socket = io(API_BASE + "/chat", { transports: ["polling"] });
      socket.on("connect", () => setSocketConnected(true));
      socket.on("disconnect", () => setSocketConnected(false));
      GlobalState.setState({ socketClient: socket });
      console.log("[socket.io] initialized");
    } else {
      GlobalState.state.socketClient.emit("chat", {
        action: "auth",
        session: GlobalState.state.session
      });
    }
  }, []);

  useEffect(() => {
    const socket = GlobalState.state.socketClient;
    if (socket == null) return;

    socket.emit("chat", {
      action: "auth",
      session: GlobalState.state.session
    });
  }, [socketConnected]);

  const chatEventHandler = useCallback(
    (data) => {
      const myUsername = GlobalState.state.username;
      if (myUsername == null) {
        console.log("chatEventHandler(): received chat event but not logged in.");
        return;
      }

      let key: string;
      let newMessageEntry: any;

      if (data.action == "send_confirm") {
        key = data.to;
        newMessageEntry = {
          username: myUsername,
          timestamp: data.timestamp,
          message: data.message
        };
      } else if (data.action == "recv") {
        key = data.from;
        newMessageEntry = {
          username: data.from,
          timestamp: data.timestamp,
          message: data.message
        };
      } else {
        return;
      }

      GlobalState.setState((prevState: GlobalStateType) => {
        const prevMessages = prevState.messages;
        if (prevMessages[key] == undefined) {
          prevMessages[key] = [newMessageEntry];
        } else {
          prevMessages[key] = [...prevMessages[key], newMessageEntry];
        }
        return {
          messages: prevMessages
        };
      });
    },
    [GlobalState.state.username]
  );

  useEffect(() => {
    GlobalState.state.socketClient?.off("chat");
    GlobalState.state.socketClient?.on("chat", (data) => chatEventHandler(data));
  }, [chatEventHandler]);

  if (!fontLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Spinner
        visible={!socketConnected}
        customIndicator={<SkypeIndicator color="white" />}
        animation="fade"
        textContent="Connecting..."
        textStyle={styles.socketConnectingText}
      />
      <StatusBar barStyle="dark-content" />
      <AppStack />
      <FlashMessage
        position="top"
        floating
        duration={6000}
        titleStyle={styles.flashMessageTitle}
        textStyle={styles.flashMessageText}
      />
    </NavigationContainer>
  );
};

export default Pinnect;

const styles = StyleSheet.create({
  flashMessageTitle: {
    fontFamily: AppFontFamily.BOLD
  },
  flashMessageText: {
    fontFamily: AppFontFamily.NORMAL
  },
  socketConnectingText: {
    fontFamily: AppFontFamily.BOLD,
    color: "white"
  }
});
