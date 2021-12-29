import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import { ListItem } from "react-native-elements";
import IoniconsIcon from "react-native-vector-icons/Ionicons";
import { MaterialIndicator } from "react-native-indicators";
import { showMessage } from "react-native-flash-message";

import AppText from "../../components/app-text";
import AppSwitch from "../../components/app-switch";
import Context from "../../contexts/global-state";
import { useNavigation } from "@react-navigation/core";

const ItemDarkMode = () => {
  const GlobalState = useContext(Context);

  return (
    <ListItem containerStyle={styles.item}>
      <ListItem.Content style={styles.itemContent}>
        <IoniconsIcon
          name="moon-outline"
          size={16}
          color="gray"
          style={styles.itemIcon}
        />
        <ListItem.Title style={styles.itemLeft}>
          <AppText style={styles.itemTitle}>Dark Mode</AppText>
        </ListItem.Title>
        <AppSwitch
          value={GlobalState.state.preferences.darkMode}
          onValueChange={(value) => {
            GlobalState.setState({
              preferences: { ...GlobalState.state.preferences, darkMode: value }
            });
          }}
          style={styles.switch}
        />
      </ListItem.Content>
    </ListItem>
  );
};

const ItemClearCache = () => {
  const GlobalState = useContext(Context);
  const [busy, setBusy] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  useEffect(() => {
    async function getCacheSize() {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir == null) return;

      try {
        await FileSystem.readDirectoryAsync(cacheDir + "ImagePicker");
      } catch {}

      //TODO
    }

    getCacheSize();
  }, []);

  return (
    <ListItem
      containerStyle={styles.item}
      disabled={busy || cacheSize == -1}
      onPress={() => {
        console.log(GlobalState.state.socketClient?.connected);
        setBusy(true);
        setTimeout(() => setBusy(false), 2000);
      }}
    >
      <ListItem.Content style={styles.itemContent}>
        <IoniconsIcon
          name="trash"
          size={16}
          color="gray"
          style={styles.itemIcon}
        />
        <ListItem.Title style={styles.itemLeft}>
          <AppText style={styles.itemTitle}>Clear Cache</AppText>
        </ListItem.Title>
        {!busy ? (
          <AppText style={styles.itemSubtitle}>
            {cacheSize == -1
              ? "Calculating..."
              : (cacheSize / 1024 / 1024).toFixed(2) + "M"}
          </AppText>
        ) : (
          <MaterialIndicator color="gray" size={16} style={styles.indicator} />
        )}
      </ListItem.Content>
    </ListItem>
  );
};

const ItemLogout = () => {
  const GlobalState = useContext(Context);
  const profileStack = useNavigation();

  const handlePress = useCallback(() => {
    Alert.alert("Are you sure to log out?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          GlobalState.setState({ session: null, username: null });
          GlobalState.state.socketClient?.emit("chat", {
            action: "auth",
            session: null
          });
          profileStack.navigate("AuthChoiceScreen");
        }
      }
    ]);
  }, []);

  if (GlobalState.state.session == null) {
    return null;
  }

  return (
    <ListItem containerStyle={styles.item} onPress={handlePress}>
      <ListItem.Content style={styles.itemContent}>
        <IoniconsIcon
          name="exit-outline"
          size={16}
          color="red"
          style={styles.itemIcon}
        />
        <ListItem.Title style={styles.itemLeft}>
          <AppText style={[styles.itemTitle, styles.itemLogoutText]}>
            Log out
          </AppText>
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
};

const ItemEditProfile = () => {
  const GlobalState = useContext(Context);
  const profileStack = useNavigation();

  const handlePress = useCallback(() => {
    if (GlobalState.state.session == null) {
      showMessage({
        message: "You are not logged in.",
        type: "warning"
      });
      return null;
    }
    profileStack.navigate("EditProfileScreen");
  }, [GlobalState.state.session]);

  return (
    <ListItem containerStyle={styles.item} onPress={handlePress}>
      <ListItem.Content style={styles.itemContent}>
        <IoniconsIcon
          name="create-outline"
          size={16}
          color="gray"
          style={styles.itemIcon}
        />
        <ListItem.Title style={styles.itemLeft}>
          <AppText style={styles.itemTitle}>Edit Profile</AppText>
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
};

const ItemLikedPins = () => {
  const GlobalState = useContext(Context);
  const profileStack = useNavigation();

  const handlePress = useCallback(() => {
    if (GlobalState.state.session == null) {
      showMessage({
        message: "You are not logged in.",
        type: "warning"
      });
      return null;
    }
    profileStack.navigate("LikedPinsScreen");
  }, [GlobalState.state.session]);

  return (
    <ListItem containerStyle={styles.item} onPress={handlePress}>
      <ListItem.Content style={styles.itemContent}>
        <IoniconsIcon
          name="heart-outline"
          size={16}
          color="gray"
          style={styles.itemIcon}
        />
        <ListItem.Title style={styles.itemLeft}>
          <AppText style={styles.itemTitle}>My Likes</AppText>
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
};

const ItemEditInterests = () => {
  const GlobalState = useContext(Context);
  const profileStack = useNavigation();

  const handlePress = useCallback(() => {
    if (GlobalState.state.session == null) {
      showMessage({
        message: "You are not logged in.",
        type: "warning"
      });
      return null;
    }
    profileStack.navigate("EditInterestsScreen");
  }, [GlobalState.state.session]);

  return (
    <ListItem containerStyle={styles.item} onPress={handlePress}>
      <ListItem.Content style={styles.itemContent}>
        <IoniconsIcon
          name="happy-outline"
          size={16}
          color="gray"
          style={styles.itemIcon}
        />
        <ListItem.Title style={styles.itemLeft}>
          <AppText style={styles.itemTitle}>My Interests</AppText>
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
};

export {
  ItemDarkMode,
  ItemClearCache,
  ItemLogout,
  ItemEditProfile,
  ItemLikedPins,
  ItemEditInterests
};

const styles = StyleSheet.create({
  item: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    height: 46
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  itemIcon: {
    marginRight: 16
  },
  itemTitle: {
    color: "black"
  },
  itemSubtitle: {
    color: "gray"
  },
  itemLeft: {
    flex: 1
  },
  indicator: {
    flex: 0
  },
  itemLogoutText: {
    color: "red"
  },
  switch: {
    marginRight: -6
  }
});
