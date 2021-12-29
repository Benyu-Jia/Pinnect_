import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { MaterialIndicator } from "react-native-indicators";
import Spinner from "react-native-loading-spinner-overlay";

import AppInputBox from "../../components/app-input-box";
import Button from "../../components/button";
import { fetchAPI } from "../../helpers/fetch";

async function handleResetButton(email: string, newPassword: string) {
  const result = await fetchAPI("resetPassword", "POST", {
    email: email,
    newPassword: newPassword
  });
  if (result.data.error != 0) {
    showMessage({ message: result.data.message, type: "danger" });
    return;
  }
  showMessage({
    message: "You have requested a password reset.",
    description:
      "An email containing necessary steps to reset the password has been sent to " +
      email +
      "." +
      "\n\n" +
      "If you did not receive the email, please check your junk mailbox.",
    type: "info",
    duration: 30000
  });
}

const ForgetPassword = () => {
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <KeyboardAvoidingView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          <Spinner customIndicator={<MaterialIndicator color="white" />} visible={busy} />
          <View>
            <AppInputBox
              placeholder="email@example.com"
              clearButtonMode="always"
              textContentType="emailAddress"
              onChangeText={(value: string) => setEmail(value)}
              style={styles.textbox}
            />
            <AppInputBox
              placeholder="New password"
              clearButtonMode="always"
              textContentType="password"
              secureTextEntry={true}
              onChangeText={(value: string) => setNewPassword(value)}
              style={styles.textbox}
            />
            <View style={styles.buttonContainer}>
              <Button
                disabled={email == ""}
                type={email == "" ? "muted" : "primary"}
                title="Reset"
                style={styles.button}
                textStyle={styles.buttonText}
                onPress={async () => {
                  setBusy(true);
                  await handleResetButton(email, newPassword);
                  setBusy(false);
                }}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgetPassword;

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
  textbox: {
    marginTop: 8,
    marginBottom: 8
  },
  buttonContainer: {
    marginTop: 20
  },
  button: {
    marginTop: 8,
    marginBottom: 8
  },
  buttonText: {
    fontWeight: "bold"
  }
});
