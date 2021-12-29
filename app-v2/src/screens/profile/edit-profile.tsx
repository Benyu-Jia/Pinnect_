import React from "react";

import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from "react-native";
import { showMessage } from "react-native-flash-message";
import AppInputBox from "../../components/app-input-box";
import Context from "../../contexts/global-state";
import Button from "../../components/button";
import AppText from "../../components/app-text";
import { fetchAPI } from "../../helpers/fetch";

export default class EditProfileScreen extends React.Component {
  static contextType = Context;

  state = {
    first_name: "",
    last_name: "",
    age: "",
    gender: "",
    phone: "",
    option: "",
    val: "",
    busy: false
  };

  constructor(props: any, context: any) {
    super(props);
    this.context = context;
  }

  checkInputValid = () => {
    //var reg = new RegExp('^\d+$');
    if (this.state.age != "") {
      let isnum = /^\d+$/.test(this.state.age);
      if (isnum == false) {
        showMessage({
          message: "Sorry. Age must only contain digits.",
          type: "error"
        });
        return false;
      }
    }
    if (this.state.phone != "") {
      let isnum = /^\d+$/.test(this.state.phone);
      if (isnum == false) {
        showMessage({
          message: "Sorry. Phone number must only contain digits.",
          type: "error"
        });
        return false;
      }
      if (this.state.phone.length < 3 || this.state.phone.length > 15) {
        showMessage({
          message: "Sorry. Phone number must be between 3 to 15 digits.",
          type: "error"
        });
        return false;
      }
    }
  };

  handleSubmitButton = () => {
    this.setState({
      busy: true
    });
    //check input validity (age, phone)
    var valid = this.checkInputValid();
    if (valid == false) {
      this.setState({ busy: false });
      return;
    }

    if (this.state.first_name != "") {
      this.state.option = "first_name";
      this.state.val = this.state.first_name;
      this.handleRequests();
    }
    if (this.state.last_name != "") {
      this.state.option = "last_name";
      this.state.val = this.state.last_name;
      this.handleRequests();
    }
    if (this.state.age != "") {
      this.state.option = "age";
      this.state.val = this.state.age;
      this.handleRequests();
    }
    if (this.state.gender != "") {
      this.state.option = "gender";
      this.state.val = this.state.gender;
      this.handleRequests();
    }
    if (this.state.phone != "") {
      this.state.option = "phone";
      this.state.val = this.state.phone;
      this.handleRequests();
    }
    this.context.setState({ refreshProfile: !this.context.state.refreshProfile });
    this.setState({ busy: false });
  };

  handleRequests = async () => {
    const result = await fetchAPI("profile", "PUT", {
      session: this.context.state.session,
      key: this.state.option,
      val: this.state.val
    });
    if (result.data.error != 0) {
      showMessage({
        message: "Update profile failed.",
        type: "danger",
        icon: "auto"
      });
      return;
    } else {
      showMessage({
        message: "Your profile is updated successfully!",
        type: "success",
        icon: "auto"
      });
      return;
    }
  };

  render() {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerContainer}>
              <AppText style={styles.pageTitle}>
                Enter New Information to Update Your Profile
              </AppText>
              <View style={styles.textboxGroup}>
                <AppInputBox
                  onChangeText={(text: string) => this.setState({ first_name: text })}
                  placeholder="First Name"
                  clearButtonMode="always"
                  textContentType={"name"}
                  style={styles.textbox}
                />
                <AppInputBox
                  onChangeText={(text: string) => this.setState({ last_name: text })}
                  placeholder="Last Name"
                  clearButtonMode="always"
                  textContentType={"name"}
                  style={styles.textbox}
                />
                <AppInputBox
                  onChangeText={(text: string) => this.setState({ age: text })}
                  placeholder="Age"
                  clearButtonMode="always"
                  textContentType={"name"}
                  style={styles.textbox}
                />
                <AppInputBox
                  onChangeText={(text: string) => this.setState({ gender: text })}
                  placeholder="Gender"
                  clearButtonMode="always"
                  textContentType={"name"}
                  style={styles.textbox}
                />
                <AppInputBox
                  onChangeText={(text: string) => this.setState({ phone: text })}
                  placeholder="Phone number"
                  clearButtonMode="always"
                  textContentType={"name"}
                  style={styles.textbox}
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button
                  title="Submit Changes"
                  type="primary"
                  onPress={this.handleSubmitButton}
                  style={styles.button}
                  textStyle={styles.buttonText}
                />
              </View>
              <View style={{ flex: 1 }} />
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    marginBottom: 8
  },
  container: {
    //alignItems: "stretch",
    backgroundColor: "white",
    flex: 1
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
  pageTitle: {
    fontSize: 26,
    marginBottom: 16
  },
  innerContainer: {
    flex: 1,
    marginTop: 20,
    marginLeft: 36,
    marginRight: 36
  },
  textboxGroup: {}
});
