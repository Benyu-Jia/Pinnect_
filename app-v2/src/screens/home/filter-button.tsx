import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Ionicons";
import { isIphoneWithNotch } from "../../helpers/utils";

const FilterButton = (props: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.filterButton} onPress={props.onPress}>
      <Icon name="md-filter" size={24} />
    </TouchableOpacity>
  );
};

export default FilterButton;

const styles = {
  filterButton: {
    backgroundColor: "white",
    margin: 24,
    marginTop: -6,
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
