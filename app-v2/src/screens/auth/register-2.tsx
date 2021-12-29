import React, { useContext, useEffect, useState } from "react";
import { Keyboard, StyleSheet, View, TouchableWithoutFeedback, Alert } from "react-native";
import { showMessage } from "react-native-flash-message";
import Spinner from "react-native-loading-spinner-overlay";

import AppInputBox from "../../components/app-input-box";
import Button from "../../components/button";
import { fetchAPI } from "../../helpers/fetch";
import Context, { GlobalContext } from "../../contexts/global-state";
import AppText from "../../components/app-text";

async function handleSignupButton(email: string, GlobalState: GlobalContext, navigation: any) {
  if (email == "") {
    Alert.alert(
      "Continue without email address?",
      "You can connect an email to your account later.",
      [
        {
          text: "Yes",
          onPress: () => navigation.navigate("InitialInterestsScreen")
        },
        {
          text: "Cancel"
        }
      ]
    );
    return;
  }

  const result = await fetchAPI("email", "PUT", {
    session: GlobalState.state.session,
    email: email
  });
  if (result.data.error != 0) {
    showMessage({
      message:
        "Cannot connect the email address to the account at the moment. Please check again later.",
      type: "danger",
      icon: "auto"
    });
    return;
  }
  showMessage({
    message: "Welcome to Pinnect!",
    type: "success",
    icon: "auto"
  });
  navigation.navigate("InitialInterestsScreen");
}

const RegisterScreen2 = (props: any) => {
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const GlobalState = useContext(Context);
  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => null,
      gestureEnabled: false
    });
  }, []);

  return (
    <View style={styles.container}>
      <Spinner visible={busy} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          <View style={styles.textboxGroup}>
            <AppInputBox
              onChangeText={(text: string) => setEmail(text)}
              placeholder="example@email.com (Optional)"
              clearButtonMode="always"
              textContentType="emailAddress"
              style={styles.textbox}
            />
          </View>
          <AppText style={styles.tip}>
            Connecting an email address to your account allows you to recover your account when you
            lose access to it.
          </AppText>
          <AppText style={styles.tip}>
            {"By signing up, you agree to Pinnect's "}
            <AppText style={styles.tipUnderlined}>Terms of Service</AppText>
            {" and "}
            <AppText style={styles.tipUnderlined}>Privacy Policy</AppText>.
          </AppText>
          <View style={styles.buttonContainer}>
            <Button
              title="SIGN UP"
              type="primary"
              onPress={async () => {
                setBusy(true);
                await handleSignupButton(email, GlobalState, props.navigation);
                setBusy(false);
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

export default RegisterScreen2;

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
  textboxGroup: {},
  textbox: {
    marginTop: 8,
    marginBottom: 8
  },
  tip: {
    color: "gray",
    marginTop: 20
  },
  tipUnderlined: {
    color: "gray",
    marginTop: 20,
    textDecorationLine: "underline"
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
  }
});
