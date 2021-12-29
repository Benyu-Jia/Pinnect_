import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Icon } from "react-native-elements";
import { timeDifference } from "../../../helpers/utils";
import AppText from "../../../components/app-text";
import { useContext } from "react";
import Context from "../../../contexts/global-state";
import { useNavigation } from "@react-navigation/core";

export default function LikedPinsList(props: { data: any }) {
  const context = useContext(Context);
  const profileStack = useNavigation();

  // 直接导入pins json data，显示list. 例子： <Like_list {...pins}/>
  return (
    <FlatList
      contentContainerStyle={styles.pinContainer}
      data={props.data.pins}
      renderItem={({ item }) => (
        <View>
          {/*pressable not linked to navigation*/}
          <View style={styles.container}>
            {/* render icon */}
            <View style={styles.iconRow}>
              <Image
                style={styles.pinIcon}
                source={require("../../../../assets/pin_image.png")}
              />
            </View>
            <View style={styles.pinRow}>
              {/* render pin subject */}
              <View style={styles.pinColumn}>
                <AppText style={styles.pinText}>
                  {item.data.content.subject}
                </AppText>
              </View>
              <View style={styles.pinNameColumn}>
                {/* render coordinates */}
                <AppText style={styles.pinNameText}>
                  Posted by {item.data.username} {timeDifference(item.created_at)} ago
                </AppText>
              </View>
            </View>
            <View style={styles.iconRow}>
              {/* render icon */}
              <TouchableOpacity
                onPress={() => {
                  profileStack.navigate("Home");
                  context.state.homeScreenRef.current?.presentPin(item._id);
                }}
              >
                <Icon
                  name="chevron-forward-outline"
                  underlayColor="transparent"
                  type="ionicon"
                  iconStyle={styles.navigateIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      keyExtractor={(item: any) => item._id}
      ItemSeparatorComponent={() => separator}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 15,
    marginTop: 15
  },
  pinContainer: {
    backgroundColor: "#FFF",
    //flex: 1,
    paddingTop: 0
  },
  pinColumn: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 5
  },
  pinIcon: {
    marginLeft: 22,
    height: 34,
    width: 22
  },
  navigateIcon: {
    color: "black",
    fontSize: 25
  },
  pinNameColumn: {
    flexDirection: "column",
    width: 250,
    justifyContent: "flex-start"
  },
  pinNameText: {
    color: "gray",
    fontSize: 14
  },
  pinRow: {
    flex: 8,
    flexDirection: "column",
    justifyContent: "center"
  },
  pinText: {
    fontSize: 16
  },
  iconRow: {
    flex: 2,
    justifyContent: "center"
  }
});

const separator = (
  <View
    style={{
      height: 1,
      width: "86%",
      backgroundColor: "#CED0CE",
      marginLeft: "14%"
    }}
  />
);
