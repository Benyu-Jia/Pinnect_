import * as React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { GestureResponderEvent, StyleSheet, View, TouchableHighlight } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

const GradientPlusButton = (props: { onPress: (event: GestureResponderEvent) => void }) => {
  return (
    <View style={styles.container}>
      <TouchableHighlight style={styles.button} onPress={props.onPress}>
        <LinearGradient colors={["red", "fuchsia"]} style={styles.buttonContent}>
          <Icon name="plus" size={24} color="white" style={styles.buttonIcon} />
        </LinearGradient>
      </TouchableHighlight>
    </View>
  );
};

export default GradientPlusButton;

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    marginLeft: 16,
    marginRight: 16,
    height: 40,
    width: 80
  },
  button: {
    flex: 1,
    borderRadius: 16
  },
  buttonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16
  },
  buttonIcon: {}
});
