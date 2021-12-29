import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Ionicons";
import { isIphoneWithNotch } from "../../helpers/utils";

const RecenterButton = (props: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.recenterButton} onPress={props.onPress}>
      <Icon name="md-locate-outline" size={24} />
    </TouchableOpacity>
  );
};

export default RecenterButton;

const styles = {
  recenterButton: {
    backgroundColor: "white",
    margin: 24,
    marginTop: isIphoneWithNotch() ? 8 : 16,
    padding: 8,
    borderRadius: 24,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      height: 0,
      width: 0
    }
  }
};
