import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  ImageBackground,
  Linking,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import { TouchableOpacity } from "react-native-gesture-handler";

import AppText from "../../components/app-text";
import SettingsButton from "../../components/stack-settings-button";
import Context from "../../contexts/global-state";
import useProfile from "../../hooks/use-profile";
import { Card, Icon } from "react-native-elements";
import Email from "./profile-components/email";
import Separator from "./profile-components/separator";
import Tel from "./profile-components/tel";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { API_BASE, fetchAPI } from "../../helpers/fetch";
import { showMessage } from "react-native-flash-message";
import AvatarImagePicker from "../../components/avatar-picker";

const ProfileScreen = React.memo(() => {
  const GlobalState = useContext(Context);
  const profileStack = useNavigation();
  useEffect(() => {
    profileStack.setOptions({
      headerRight: () => <SettingsButton onPress={() => profileStack.navigate("SettingsScreen")} />
    });
  }, []);
  useEffect(() => {
    if (GlobalState.state.username) profileStack.setOptions({ title: GlobalState.state.username });
    else profileStack.setOptions({ title: "Profile" });
  }, [GlobalState.state.session]);

  if (!GlobalState.state.session || !GlobalState.state.username) {
    return (
      <SafeAreaView style={styles.warningContainer}>
        <TouchableOpacity
          style={styles.loginScreenTouchable}
          onPress={() => profileStack.dangerouslyGetParent()?.navigate("AuthChoiceScreen")}
        >
          <AppText style={styles.loginPrompt}>Log in to have your own profile!</AppText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ProfileContent
      session={GlobalState.state.session}
      username={GlobalState.state.username}
      reloadTrigger={GlobalState.state.refreshProfile}
    />
  );
});

const ProfileContent = (props: { session: string; username: string; reloadTrigger: boolean }) => {
  const [profile, avatar] = useProfile(props.username, "xlarge", props.reloadTrigger);

  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    async function loadEmail() {
      const result = await fetchAPI("email", "POST", {
        session: props.session
      });
      if (result.data.error != 0) {
        showMessage({ message: result.data.message, type: "danger" });
        return;
      }
      setEmail(result.data.email);
    }

    loadEmail();
  }, []);

  const [newAvatarUri, setNewAvatar] = useState("");

  const session = props.session;

  if (profile == null || session == null) {
    return null;
  }

  //UNSURE
  const sendNewAvatarRequest = async (uri: string) => {
    if (uri.length != 0) {
      const compressResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { height: 256, width: 256 } }],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );
      const uploadResult = await FileSystem.uploadAsync(API_BASE + "/images", compressResult.uri, {
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        httpMethod: "POST",
        parameters: { session: session, action: "avatar" }
      });
      if (uploadResult.status != 200) {
        showMessage({ message: "Cannot upload the avatar at the moment.", type: "danger" });
        await FileSystem.deleteAsync(uri);
        await FileSystem.deleteAsync(compressResult.uri);
        return;
      }
      showMessage({
        message: "Successful!",
        type: "success"
      });
      await FileSystem.deleteAsync(uri);
      await FileSystem.deleteAsync(compressResult.uri);
    }
  };

  const renderHeader = () => {
    const images = {
      img_background: require("../../../assets/red-pink-gradient.jpg")
    };
    return (
      <View>
        <ImageBackground
          style={styles.headerBackgroundImage}
          blurRadius={12}
          source={images.img_background}
        >
          <View style={styles.headerColumn}>
            <View style={styles.avatarContainer}>
              <AvatarImagePicker
                onPickedImageChange={(uri) => {
                  if (uri == null) {
                    return;
                  }

                  console.log("onPickImageChange called");
                  sendNewAvatarRequest(uri);
                  setNewAvatar(uri);
                }}
                oldAvatar={profile.avatar}
              />
            </View>
            <AppText style={styles.userNameText}>
              {profile.first_name} {profile.last_name}
            </AppText>
            <AppText style={styles.username}>@{props.username}</AppText>
            <View style={styles.userInfoRow}>
              <View style={styles.iconInfo}>
                <Icon
                  name="man-outline"
                  underlayColor="transparent"
                  type="ionicon"
                  iconStyle={styles.infoIcon}
                />
                <AppText style={styles.userInfoText}>{profile.gender}</AppText>
              </View>
              <View style={styles.iconInfo}>
                <Icon
                  name="hourglass-outline"
                  underlayColor="transparent"
                  type="ionicon"
                  iconStyle={styles.infoIcon}
                />
                <AppText style={styles.userInfoText}>{profile.age}</AppText>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const onPressTel = (number: any) => {
    Linking.openURL(`tel://${number}`).catch((err) => console.log("Error:", err));
  };

  const onPressSms = () => {
    console.log("sms");
  };

  const onPressEmail = (email: any) => {
    Linking.openURL(`mailto://${email}?subject=subject&body=body`).catch((err) =>
      console.log("Error:", err)
    );
  };

  const renderTel = () => {
    return (
      <View style={styles.telContainer}>
        <Tel
          index={0}
          name="Work / Personal"
          number={profile.phone}
          onPressSms={onPressSms}
          onPressTel={onPressTel}
        />
      </View>
    );
  };

  const renderEmail = () => {
    return (
      <View style={styles.emailContainer}>
        <Email index={0} name="Work / Personal" email={email} onPressEmail={onPressEmail} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        <Card containerStyle={styles.cardContainer}>
          {renderHeader()}
          {renderTel()}
          {Separator()}
          {renderEmail()}
        </Card>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  warningContainer: {
    flex: 1,
    alignItems: "center"
  },
  cardContainer: {
    backgroundColor: "#FFF",
    borderWidth: 0,
    flex: 1,
    margin: 0,
    padding: 0
  },
  scroll: {
    //backgroundColor: "#FFF"
  },
  loginPrompt: {
    color: "gray",
    margin: 32
  },
  loginScreenTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 10
  },
  usernameContainer: {
    marginTop: 8
  },
  username: {
    fontSize: 16
  },
  headerBackgroundImage: {
    paddingBottom: 20,
    paddingTop: 20
  },
  topButtonRow: {
    marginBottom: 0,
    flexDirection: "row-reverse",
    justifyContent: "space-between"
  },
  editbutton: {
    backgroundColor: "white",
    right: 0,
    marginRight: 24,
    borderRadius: 50,
    padding: 8
  },
  headerColumn: {
    backgroundColor: "transparent",
    ...Platform.select({
      ios: {
        alignItems: "center",
        elevation: 1,
        marginTop: 1
      },
      android: {
        alignItems: "center"
      }
    })
  },
  iconInfo: {
    alignItems: "center",
    flexDirection: "row"
  },
  userInfoRow: {
    alignItems: "center",
    flexDirection: "row"
  },
  userInfoText: {
    color: "black",
    fontSize: 15,
    textAlign: "center",
    marginLeft: 6,
    marginRight: 30
  },
  userNameText: {
    color: "black",
    fontSize: 22,
    paddingTop: 4,
    paddingBottom: 4,
    textAlign: "center"
  },
  infoIcon: {
    color: "black",
    fontSize: 26
  },
  telContainer: {
    backgroundColor: "#FFF",
    flex: 1,
    paddingTop: 30
  },
  emailContainer: {
    backgroundColor: "#FFF",
    flex: 1,
    paddingTop: 30
  }
});
