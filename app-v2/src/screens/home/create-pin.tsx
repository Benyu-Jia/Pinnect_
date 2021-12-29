import React, { createRef, useCallback, useContext, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  TouchableOpacity
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { RouteProp } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { RadioButton } from "react-native-paper";
import {} from "react-native-gesture-handler";

import AppInputBox from "../../components/app-input-box";
import AppText from "../../components/app-text";
import Button from "../../components/button";
import AppImagePicker from "../../components/image-picker";
import Context, { GlobalContext } from "../../contexts/global-state";
import { API_BASE, fetchAPI } from "../../helpers/fetch";
import { getCurrentLocation } from "../../helpers/location";
import AppFontFamily from "../../constants/fonts";

const WORD_LIMIT = 400;

type CreatePinScreenProps = {
  route: RouteProp<Record<string, object | undefined>, "CreatePinScreen">;
  navigation: any;
};

/**
 * @deprecated Deprecated due to performance issues.
 */
const _CreatePinScreenLegacy = (props: CreatePinScreenProps) => {
  const GlobalState = useContext(Context);
  const [subject, setSubject] = useState("");
  const [canSend, setCanSend] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSend = useCallback(async () => {
    setBusy(true);
    const location = await getCurrentLocation();
    if (location == null) return;
    const result = await fetchAPI("pin", "POST", {
      session: GlobalState.state.session,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
      subject: subject,
      type: ""
    });
    setTimeout(async () => {
      if (result.data.error != 0) {
        setBusy(false);
        return;
      }
      showMessage({
        message: "Success!",
        type: "success",
        icon: "auto"
      });
      setBusy(false);
      await GlobalState.state.homeScreenRef.current?.redrawPins();
      props.navigation.goBack();
      return;
    }, 500);
  }, [subject]);

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <Button
          title={!busy ? "DROP" : undefined}
          type={canSend ? "simple" : "simple-muted"}
          disabled={busy || !canSend}
          busy={busy}
          style={styles.dropButton}
          textStyle={styles.dropButtonText}
          onPress={handleSend}
          onPressEffect="opacity"
        />
      )
    });
  }, [busy, subject, canSend]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          <AppInputBox
            border="none"
            placeholder="What's happening?"
            style={styles.textbox}
            multiline
            scrollEnabled={true}
            onChangeText={(text) => {
              setSubject(text);
              setCanSend(text != "" && text.length <= WORD_LIMIT);
            }}
          />

          <AppText
            style={subject.length <= WORD_LIMIT ? styles.wordCounter : styles.wordCounterWarning}
          >
            {subject.length} / {WORD_LIMIT}
          </AppText>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

type CreatePinScreenState = {
  subject: string;
  type: string;
  canSend: boolean;
  busy: boolean;
  imageUploadedFilename: string | null;
  recommendedTags: string[];
  pickedTags: string[];
};

export default class CreatePinScreen extends React.PureComponent<CreatePinScreenProps> {
  static contextType = Context;

  state: CreatePinScreenState = {
    subject: "",
    type: "public",
    canSend: false,
    busy: false,
    imageUploadedFilename: null,
    recommendedTags: [],
    pickedTags: []
  };

  constructor(props: CreatePinScreenProps, context: GlobalContext) {
    super(props);
    this.context = context;
  }

  handleImageChange = (uri: string | null) => {
    if (uri != null) {
      this.uploadImageAndRenderTags(uri);
    } else {
      this.setState({
        imageUploadedFilename: null,
        recommendedTags: [],
        pickedTags: []
      });
    }
  };

  uploadImageAndRenderTags = async (imageUri: string) => {
    // Compress image
    const compressResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { height: 1536 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // If the compressed one is larger in size than the original (sometimes),
    // use the original one
    const sizeOriginal = (await FileSystem.getInfoAsync(imageUri)).size;
    const sizeCompress = (await FileSystem.getInfoAsync(compressResult.uri)).size;
    if (!sizeOriginal || !sizeCompress) {
      return;
    }
    const uploadResult = await FileSystem.uploadAsync(
      API_BASE + "/images",
      sizeOriginal > sizeCompress ? compressResult.uri : imageUri,
      {
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        httpMethod: "POST",
        parameters: { session: this.context.state.session, action: "general" }
      }
    );

    if (uploadResult.status != 200) {
      showMessage({ message: "Failed to upload image.", type: "danger" });
      await FileSystem.deleteAsync(imageUri);
      await FileSystem.deleteAsync(compressResult.uri);
      this.setState({ busy: false, imageUploadedFilename: null, recommendedTags: [] });
      this.props.navigation.pop();
      this.props.navigation.navigate("CreatePinScreen");
      return;
    }
    const imageUploadedFilename = JSON.parse(uploadResult.body).filename;
    this.setState({ imageUploadedFilename: imageUploadedFilename });
    await FileSystem.deleteAsync(imageUri);
    await FileSystem.deleteAsync(compressResult.uri);

    // Generate image tag
    const imageTagResult = await fetchAPI("tag", "POST", {
      session: this.context.state.session,
      filename: imageUploadedFilename
    });
    if (imageTagResult.data.error != 0) {
      console.log(imageTagResult.data);
      showMessage({ message: "Tag service is not available at the moment.", type: "danger" });
      this.setState({ busy: false, recommendedTags: [] });
      return;
    }
    this.setState({ recommendedTags: imageTagResult.data.data });
  };

  handleSend = async () => {
    this.setState({ busy: true });

    const location = await getCurrentLocation();
    if (!location) return;

    // Send create-pin request.
    let subjectWithTags = this.state.subject + " ";
    for (let tags of this.state.pickedTags) {
      subjectWithTags += "#" + tags + " ";
    }
    subjectWithTags = subjectWithTags.trim();

    const createPinResult = await fetchAPI("pin", "POST", {
      session: this.context.state.session,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
      subject: subjectWithTags,
      type: this.state.type,
      image: this.state.imageUploadedFilename
    });
    if (createPinResult.data.error != 0) {
      showMessage({ message: createPinResult.data.message, type: "danger" });
      this.setState({ busy: false });
      return;
    }

    showMessage({ message: "Success!", type: "success", icon: "auto" });
    const homeScreen = this.context.state.homeScreenRef.current;
    await homeScreen.redrawPins();
    this.props.navigation.goBack();
    this.setState({ busy: false });
    return;
  };

  renderSendButton = () => {
    this.props.navigation.setOptions({
      headerRight: () => (
        <Button
          title={!this.state.busy ? "DROP" : undefined}
          type={this.state.canSend ? "simple" : "simple-muted"}
          disabled={this.state.busy || !this.state.canSend}
          busy={this.state.busy}
          style={styles.dropButton}
          textStyle={styles.dropButtonText}
          onPress={this.handleSend}
          onPressEffect="opacity"
        />
      )
    });
  };

  componentDidMount() {
    this.renderSendButton();
  }

  componentDidUpdate(prevProps: CreatePinScreenProps, prevState: any) {
    if (prevState.canSend == this.state.canSend && prevState.busy == this.state.busy) return;
    this.renderSendButton();
  }

  render() {
    console.log(this.state.pickedTags);

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={84}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={true}>
          <View style={styles.innerContainer}>
            <AppInputBox
              border="none"
              placeholder="What's happening?"
              style={styles.textbox}
              multiline
              scrollEnabled={true}
              onChangeText={(text) =>
                this.setState({
                  subject: text,
                  canSend: text != "" && text.length <= WORD_LIMIT
                })
              }
            />
            <TagPicker
              tags={this.state.recommendedTags}
              onValueChange={(selection) => {
                this.setState({ pickedTags: selection });
              }}
            />
            <AppText
              style={
                this.state.subject.length <= WORD_LIMIT
                  ? styles.wordCounter
                  : styles.wordCounterWarning
              }
            >
              {this.state.subject.length} / {WORD_LIMIT}
            </AppText>
            <View style={styles.imagePickerContainer}>
              <AppImagePicker onPickedImageChange={this.handleImageChange} />
            </View>
            <View style={styles.visibilityControl}>
              <AppText style={styles.visibilityTitle}>Visibility</AppText>
              <AppText style={styles.visibilitySubtitle}>Controls who can view this pin</AppText>
              <RadioButton.Group
                onValueChange={(value) => this.setState({ type: value })}
                value={this.state.type}
              >
                <RadioButton.Item
                  label="Public"
                  labelStyle={styles.visibilityText}
                  style={styles.visibilityItem}
                  value="public"
                />
                <RadioButton.Item
                  label="Friend-only"
                  labelStyle={styles.visibilityText}
                  value="friend"
                />
                <RadioButton.Item
                  label="Private"
                  labelStyle={styles.visibilityText}
                  value="private"
                />
              </RadioButton.Group>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
}

type TagPickerProps = {
  tags: string[];
  onValueChange: (selection: string[]) => void;
};

const TagPicker = React.memo((props: TagPickerProps) => {
  const [selections, setSelections] = useState<string[]>([]);

  // If props changed, clear current selection
  useEffect(() => {
    setSelections([]);
  }, [props.tags]);

  const isSelected = useCallback(
    (tag: string) => {
      return selections.includes(tag);
    },
    [selections]
  );

  const calculateNewSelection = useCallback(
    (tag: string, prevSelections: string[], select: boolean) => {
      if (select) return [...prevSelections, tag];
      else return prevSelections.filter((e) => e !== tag);
    },
    []
  );

  const handleTagPress = useCallback(
    (tag: string) => {
      const newSelection = calculateNewSelection(tag, selections, !isSelected(tag));
      setSelections(newSelection);
      props.onValueChange(newSelection);
    },
    [selections]
  );

  console.log("TagPicker rendered");
  console.log("     props : " + JSON.stringify(props));
  console.log("selections : " + JSON.stringify(selections));

  if (props.tags.length == 0) {
    return null;
  }

  return (
    <View>
      <AppText style={styles.tagPickerTitle}>Tags you may be interested in</AppText>
      <ScrollView
        style={styles.tagPickerTags}
        directionalLockEnabled={true}
        contentContainerStyle={styles.tagPickerTags}
        bounces={false}
      >
        {props.tags.map((tag, index) => {
          if (!isSelected(tag)) {
            return (
              <TouchableOpacity
                key={index}
                style={styles.tagPickerTagUnselected}
                onPress={() => handleTagPress(tag)}
              >
                <AppText style={styles.tagPickerTagTextUnselected}>#{tag}</AppText>
              </TouchableOpacity>
            );
          } else {
            return (
              <TouchableOpacity
                key={index}
                style={styles.tagPickerTagSelected}
                onPress={() => handleTagPress(tag)}
              >
                <AppText style={styles.tagPickerTagTextSelected}>#{tag}</AppText>
              </TouchableOpacity>
            );
          }
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  innerContainer: {
    margin: 24,
    height: "100%"
  },
  dropButton: {
    marginRight: 8,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    width: "auto"
  },
  dropButtonText: {
    fontWeight: "bold"
  },
  textbox: {
    height: 224
  },
  wordCounter: {
    marginTop: 8,
    color: "gray",
    alignSelf: "flex-end"
  },
  wordCounterWarning: {
    marginTop: 8,
    color: "red",
    alignSelf: "flex-end"
  },
  imagePickerContainer: {
    marginTop: 16
  },
  visibilityControl: {
    marginTop: 24,
    flex: 1
  },
  visibilityTitle: {
    fontWeight: "bold",
    marginBottom: 4
  },
  visibilitySubtitle: {
    color: "gray",
    marginBottom: 8
  },
  visibilityItem: {},
  visibilityText: {
    fontFamily: AppFontFamily.NORMAL
  },
  tagPickerTitle: {
    fontWeight: "bold",
    marginBottom: 8
  },
  tagPickerTags: {
    flexDirection: "row",
    marginBottom: 8
  },
  tagPickerTagUnselected: {
    backgroundColor: "white",
    marginRight: 4,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 3,
    paddingRight: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "gainsboro"
  },
  tagPickerTagSelected: {
    backgroundColor: "#1DA1F2",
    marginRight: 4,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 3,
    paddingRight: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1DA1F2"
  },
  tagPickerTagTextUnselected: {
    color: "black"
  },
  tagPickerTagTextSelected: {
    color: "white"
  }
});
