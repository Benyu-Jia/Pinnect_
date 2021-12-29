import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

import AppTitleText from "../../components/app-title-text";
import Button from "../../components/button";
import { isIphoneWithNotch } from "../../helpers/utils";

const AuthChoiceScreen = (props: any) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        blurRadius={1}
        source={require("../../../assets/red-pink-gradient.jpg")}
        style={styles.backgroundImage}
      >
        <AppTitleText style={styles.title}>Pinnect</AppTitleText>
        <AppTitleText style={styles.subtitle}>Discover the familiar.</AppTitleText>
      </ImageBackground>
      <View style={styles.bottomBar}>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          type="light"
          onPress={() => props.navigation.navigate("RegisterScreen1")}
          title="REGISTER"
        />
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          type="primary"
          onPressEffect="highlight"
          onPress={() => props.navigation.navigate("LoginScreen")}
          title="LOG IN"
        />
      </View>
    </View>
  );
};

export default AuthChoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center"
  },
  backgroundImage: {
    flex: 8,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    tintColor: "black"
  },
  title: {
    fontWeight: "bold",
    fontSize: 60,
    color: "white",
    margin: 20
  },
  subtitle: {
    color: "white",
    fontSize: 24
  },
  bottomBar: {
    alignItems: "center",
    backgroundColor: "white",
    flex: 1,
    flexDirection: "row",
    paddingTop: 0,
    paddingBottom: isIphoneWithNotch() ? 16 : 0,
    justifyContent: "space-evenly"
  },
  button: {
    flex: 1,
    marginTop: 16,
    marginBottom: 16,
    height: 56,
    width: 160
  },
  buttonText: {
    fontWeight: "bold"
  }
});
