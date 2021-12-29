import React from "react";
import { StyleSheet } from "react-native";

import AppText from "../../components/app-text";

const ListSectionTitle: React.FC = (props) => {
  return <AppText style={styles.listSectionTitle}>{props.children}</AppText>;
};

export default ListSectionTitle;

const styles = StyleSheet.create({
  listSectionTitle: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    color: "gray"
  }
});
