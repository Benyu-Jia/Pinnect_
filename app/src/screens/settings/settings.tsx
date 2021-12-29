import * as React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Switch, View } from "react-native";
import { ListItem } from "react-native-elements";
import { showMessage } from "react-native-flash-message";
import * as FileSystem from "expo-file-system";

import * as Global from "../../helpers/global";
import PageTitle from "../../components/page-title";

const ListItemProfile = React.memo((props: any) => {
  if (props.globalState.session != null) {
    return (
      <ListItem bottomDivider onPress={() => props.stackNav.navigate("ProfileScreen")}>
        <ListItem.Content style={styles.settingsItemContent}>
          <ListItem.Title style={styles.settingsItemTitle}>My Profile</ListItem.Title>
          <ListItem.Subtitle style={styles.settingsItemSubtitle}>
            Manage your account information
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron style={styles.settingsItemChevron} size={24} />
      </ListItem>
    );
  } else {
    return (
      <ListItem bottomDivider disabled={true}>
        <ListItem.Content style={styles.settingsItemContent}>
          <ListItem.Title style={styles.settingsItemTitleDisabled}>My Profile</ListItem.Title>
          <ListItem.Subtitle style={styles.settingsItemSubtitle}>Not logged in</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron style={styles.settingsItemChevron} size={24} />
      </ListItem>
    );
  }
});

const ListItemInterest = React.memo((props: any) => {
  if (props.globalState.session != null) {
    return (
      <ListItem bottomDivider onPress={() => props.stackNav.navigate("EditInterestScreen")}>
        <ListItem.Content style={styles.settingsItemContent}>
          <ListItem.Title style={styles.settingsItemTitle}>Edit My Interests</ListItem.Title>
          <ListItem.Subtitle style={styles.settingsItemSubtitle}>
            View or reselect your interests
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron style={styles.settingsItemChevron} size={24} />
      </ListItem>
    );
  } else {
    return null;
  }
});

const ListItemClearCache = React.memo((props: any) => {
  return (
    <ListItem
      bottomDivider
      onPress={async () => {
        await listDir(FileSystem.cacheDirectory);
      }}
    >
      <ListItem.Content style={styles.settingsItemContent}>
        <ListItem.Title style={styles.settingsItemTitle}>Clear Cache</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
});

const ListItemLogout = React.memo((props: any) => {
  if (props.globalState.session == null) {
    return null;
  } else {
    return (
      <ListItem
        bottomDivider
        onPress={async () => {
          props.setGlobalState({ session: null }, async () => {
            await props.globalState.homeScreen.update();
            showMessage({ message: "Logout success!", type: "success" });
          });
        }}
      >
        <ListItem.Content style={styles.settingsItemContent}>
          <ListItem.Title style={styles.settingsItemTitleDanger}>Logout</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    );
  }
});

const syncSettingsWithServer = (session: string, settings: any) => {
  console.log("SettingsScreen.syncSettingsWithServer(): syncing settings with server");
  try {
    Global.fetchResource2("settings", "POST", {
      session: session,
      data: JSON.stringify(settings)
    });
  } catch (error) {
    console.log(error);
    showMessage({ message: "Failed to save settings", type: "danger" });
  }
};

export default (props: any) => {
  React.useEffect(() => {
    console.info(`SettingsScreen:render()`);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.topTitleContainer}>
          <PageTitle text="Settings" />
        </View>
        <ListItemProfile {...props} />
        <ListItemInterest {...props} />
        <ListItem bottomDivider>
          <ListItem.Content style={styles.settingsItemContent}>
            <ListItem.Title style={styles.settingsItemTitle}>Dark Mode</ListItem.Title>
          </ListItem.Content>
          <Switch
            style={styles.settingsItemSwitch}
            thumbColor="white"
            trackColor={{ false: "gainsboro", true: "black" }}
            value={props.globalState.settings.darkMode}
            onValueChange={(value) => {
              let settings = Object.assign({}, props.globalState.settings);
              settings.darkMode = value;
              props.setGlobalState({ settings: settings });
              if (props.globalState.session != null) {
                syncSettingsWithServer(props.globalState.session, settings);
              }
            }}
          />
        </ListItem>
        <ListItemClearCache {...props} />
        <ListItemLogout {...props} />
      </ScrollView>
    </SafeAreaView>
  );
};

const listDir = async (dir: string) => {
  const cacheDir = await FileSystem.readDirectoryAsync(dir);
  console.log(`* Listing ...${dir.substring(120, dir.length)}`);
  console.log(`* Total files: ${cacheDir.length}`);

  for (var i = 0; i < cacheDir.length; i++) {
    const fileName = cacheDir[i];
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
    console.log(
      `  - ${fileName} (${fileInfo.isDirectory ? "directory" : "file"}, ${
        fileInfo.size
      } bytes, ${Global.timeDifference(Math.floor(fileInfo.modificationTime))})`
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  settingsItemChevron: {
    padding: 4
  },
  settingsItemContent: {
    height: 48,
    padding: 4
  },
  settingsItemTitle: {
    fontFamily: "Roboto-Bold",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 4
  },
  settingsItemTitleDanger: {
    fontFamily: "Roboto-Bold",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 4,
    color: "red"
  },
  settingsItemTitleDisabled: {
    fontFamily: "Roboto-Bold",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 4,
    color: "gray"
  },
  settingsItemSubtitle: {
    fontFamily: "Roboto-Regular",
    fontSize: 15,
    color: "gray",
    marginTop: 4,
    marginBottom: 4
  },
  settingsItemSwitch: {
    marginRight: 4
  },
  topTitleContainer: {
    height: 96,
    marginTop: 48
  }
});

/*
// 留下来做参考

const testImageUpload = async (session: string = "test") => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    showMessage({
      message: "To upload images, you need to allow Pinnect to access your photo library.",
      type: "warning"
    });
    return;
  }

  let result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.1,
    base64: true
  });

  if (result.cancelled == true) {
    return;
  }

  const rawImageUri = result.uri;
  const rawImageSize = (await FileSystem.getInfoAsync(rawImageUri)).size;
  console.log("Image size before compression: " + rawImageSize);

  const manipResult = await ImageManipulator.manipulateAsync(
    rawImageUri,
    [{ resize: { height: 256, width: 256 } }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.PNG }
  );

  const compressedImageUri = manipResult.uri;
  const compressedImageSize = (await FileSystem.getInfoAsync(compressedImageUri)).size;
  console.log("Image size after compression: " + compressedImageSize);

  const uploadImageUri = compressedImageSize < rawImageSize ? compressedImageUri : rawImageUri;
  console.log("Uploading " + (compressedImageSize < rawImageSize ? "compressed" : "original"));

  try {
    const uploadResult = await FileSystem.uploadAsync(Global.getAPIUrl("images"), uploadImageUri, {
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      httpMethod: "POST",
      parameters: { session: session }
    });
    const response = JSON.parse(uploadResult.body);
    if (uploadResult.status != 200) {
      showMessage({
        message: "Upload failed",
        description: response.message,
        type: "default"
      });
    } else {
      showMessage({
        message: "Upload succeed",
        description: "Filename: " + response.filename,
        type: "default"
      });
    }
  } catch (error) {
    throw error;
  }

  await FileSystem.deleteAsync(rawImageUri);
  await FileSystem.deleteAsync(compressedImageUri);
};

*/
