import React, { useContext, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  View,
  TouchableWithoutFeedback
} from "react-native";
import * as Device from "expo-device";
import { showMessage } from "react-native-flash-message";
import Spinner from "react-native-loading-spinner-overlay";

import AppInputBox from "../../components/app-input-box";
import Button from "../../components/button";
import { fetchAPI } from "../../helpers/fetch";
import { getCurrentLocation } from "../../helpers/location";
import Context, { GlobalContext } from "../../contexts/global-state";

async function handleLoginButton(
  username: string,
  password: string,
  GlobalState: GlobalContext,
  navigation: any
) {
  const location = await getCurrentLocation();
  if (location == null) return;

  const result = await fetchAPI("login", "POST", {
    username: username,
    password: password,
    longitude: location.coords.longitude,
    latitude: location.coords.latitude,
    device_id: Device.modelName,
    device_sys_name: Device.osName,
    device_sys_ver: Device.osVersion
  });
  if (result.data.error != 0) {
    showMessage({
      message: result.data.message,
      type: "danger",
      icon: "auto"
    });
    return;
  }

  GlobalState.setState({
    session: result.data.session,
    username: result.data.username
  });
  GlobalState.state.socketClient?.emit("chat", {
    action: "auth",
    session: result.data.session
  });
  showMessage({
    message: "Welcome back!",
    type: "success",
    icon: "auto"
  });
  navigation.navigate("TabNavigator");
}

const LoginScreen = (props: any) => {
  const GlobalState = useContext(Context);
  const [busy, setBusy] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Spinner visible={busy} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          <View style={styles.textboxGroup}>
            <AppInputBox
              onChangeText={(text: string) => setUsername(text)}
              placeholder="Username"
              clearButtonMode="always"
              textContentType={"username"}
              style={styles.textbox}
            />
            <AppInputBox
              onChangeText={(text: string) => setPassword(text)}
              placeholder="Password"
              secureTextEntry
              clearButtonMode="always"
              textContentType={"password"}
              style={styles.textbox}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Log in"
              type="primary"
              onPress={async () => {
                setBusy(true);
                await handleLoginButton(
                  username,
                  password,
                  GlobalState,
                  props.navigation
                );
                setBusy(false);
              }}
              style={styles.button}
              textStyle={styles.buttonText}
            />
            <Button
              title="Forget Password"
              type="light"
              onPress={() => {
                props.navigation.navigate("ForgetPasswordScreen");
              }}
              style={styles.button}
              textStyle={styles.buttonText}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  innerContainer: {
    flex: 1,
    marginTop: 20,
    marginLeft: 36,
    marginRight: 36
  },
  button: {
    marginTop: 8,
    marginBottom: 8
  },
  buttonText: {
    fontWeight: "bold"
  },
  buttonContainer: {
    marginTop: 20
  },
  textbox: {
    marginTop: 8,
    marginBottom: 8
  },
  textboxGroup: {}
});
