import React, { createRef } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  AppState,
  Alert,
  Text
} from "react-native";
import Clipboard from "expo-clipboard";
import MapView, { Marker, Region } from "react-native-maps";
import {} from "react-native-map-clustering";
import { PulseIndicator } from "react-native-indicators";
import { initialWindowMetrics } from "react-native-safe-area-context";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView
} from "@gorhom/bottom-sheet";

import Context, { GlobalContext } from "../../contexts/global-state";
import { getCurrentLocation } from "../../helpers/location";
import MapStyles from "./map-styles";
import RecenterButton from "./recenter-button";
import FilterButton from "./filter-button";
import MapFilter from "./map-filter";
import { fetchAPI } from "../../helpers/fetch";
import Pin from "../../components/pin/pin";
import { Accuracy } from "expo-location";
import { showMessage } from "react-native-flash-message";

export const DEFAULT_LNG_DELTA = 0.02;
export const DEFAULT_LAT_DELTA = 0.02;

export default class Home extends React.PureComponent {
  static contextType = Context;

  state = {
    initialized: false,
    busy: false,
    markers: [],
    sheetContent: null,
    topInset:
      initialWindowMetrics != null ? initialWindowMetrics.insets.top : 0,
    sheetSnapPoints: ["50%", "100%"],
    visibility: [
      true,
      true,
      true
    ] /* control the visibility of different type of pins on map*/
  };
  region: Region = {
    latitude: NaN,
    longitude: NaN,
    latitudeDelta: NaN,
    longitudeDelta: NaN
  };
  mapRef = createRef<any>();
  sheetRef = createRef<BottomSheetModal>();

  constructor(props: any, context: GlobalContext) {
    super(props);
    this.context = context;
    this.context.state.homeScreenRef.current = this;
    this.setState = this.setState.bind(this);
    this.update = this.update.bind(this);

    AppState.addEventListener("change", (state) => {
      if (state === "active") this.detectClipboard();
    });
  }

  async componentDidMount() {
    let location = await getCurrentLocation();
    if (location == null) {
      return;
    }
    this.region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: DEFAULT_LAT_DELTA,
      longitudeDelta: DEFAULT_LNG_DELTA
    };

    this.setState({ initialized: true });
  }

  render() {
    // console.info("home:")
    // console.info(this.state.visibility);
    if (!this.state.initialized) {
      return <PulseIndicator color="gray" />;
    }
    return (
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            customMapStyle={
              this.context.state.preferences.darkMode
                ? MapStyles.DARK
                : MapStyles.LIGHT
            }
            showsUserLocation={true}
            initialRegion={this.region}
            ref={this.mapRef}
            onRegionChangeComplete={this._regionChangeCallback}
            //provider="google"
          >
            {this.state.markers}
          </MapView>
          <SafeAreaView>
            <View style={styles.buttonGroups}>
              <RecenterButton onPress={this.recenterMap} />
              <FilterButton onPress={this.displayFilterPage} />
              {/* <Text>{this.state.visibility[0] ? ("true") : ("false")}</Text> */}
            </View>
          </SafeAreaView>
          <BottomSheetModal
            snapPoints={this.state.sheetSnapPoints}
            ref={this.sheetRef}
            backdropComponent={BottomSheetBackdrop}
            topInset={this.state.topInset}
          >
            <KeyboardAvoidingView style={{flex: 1}} behavior={"padding"} keyboardVerticalOffset={70}>
              <BottomSheetScrollView>
                <View style={styles.sheetContainer}>
                  {this.state.sheetContent}
                </View>
              </BottomSheetScrollView>
            </KeyboardAvoidingView>
          </BottomSheetModal>
        </View>
      </BottomSheetModalProvider>
    );
  }

  displayFilterPage = () => {
    this.setState({
      sheetContent: (
        <BottomSheetScrollView>
          <MapFilter homeState={this.state} homeSetState={this.setState} update={this.update}/>
        </BottomSheetScrollView>
      )
    });
    if (this.sheetRef.current == null) {
      return;
    } else {
      this.sheetRef.current.present();
    }
  };

  update = () => {
    this.mapRef.current?.animateToRegion({
      longitude: this.region.longitude,
      latitude: this.region.latitude,
      latitudeDelta: DEFAULT_LAT_DELTA,
      longitudeDelta: DEFAULT_LNG_DELTA
    });
  };

  recenterMap = async () => {
    let location = await getCurrentLocation({ accuracy: Accuracy.Balanced });
    if (location == null) {
      return;
    }
    this.mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: DEFAULT_LAT_DELTA,
      longitudeDelta: DEFAULT_LNG_DELTA
    });
  };

  _regionChangeCallback = (region: Region) => {
    this.region = region;
    this.redrawPins();
  };

  redrawPins = async () => {
    if (this.state.busy) return;
    this.setState({ busy: true });
    const result = await fetchAPI("pinquery", "POST", {
      session: this.context.state.session,
      longitude: this.region.longitude,
      latitude: this.region.latitude,
      range: Math.floor(this.region.longitudeDelta * 69 * 1600)
    });
    if (result.data.error != 0) {
      showMessage({ message: result.data.message, type: "danger" });
      return;
    }
    const markers: JSX.Element[] = [];
    for (let index = 0; index < result.data.pins.length; index++) {
      let pin = result.data.pins[index];
      let pinColor = "red";
      if (pin.data.type == "public") {
        pinColor = "red";
        if (!this.state.visibility[0]) continue;
      } else if (pin.data.type == "friend") {
        pinColor = "blue";
        if (!this.state.visibility[1]) continue;
      } else if (pin.data.type == "private") {
        pinColor = "grey";
        if (!this.state.visibility[2]) continue;
      }
      markers.push(
        <Marker
          coordinate={{
            longitude: pin.location.coordinates[0],
            latitude: pin.location.coordinates[1]
          }}
          key={index}
          identifier={pin._id}
          pinColor={pinColor}
          title={pin.username}
          tracksViewChanges={false}
          onPress={(event) => {
            this.presentPin(event.nativeEvent.id);
          }}
        />
      );
    }
    this.setState({ busy: false, markers: markers });
  };

  presentPin = async (pinID: string) => {
    if (this.sheetRef.current == null) return;

    this.sheetRef.current.close();
    this.setState(
      {
        sheetContent: (
          <Pin
            pinID={pinID}
            username={this.context.state.username}
            session={this.context.state.session}
            withCommentsAndReply={true}
          />
        )
      },
      () => {
        if (this.sheetRef.current == null) return;
        this.sheetRef.current.present();
      }
    );
  };

  detectClipboard = async () => {
    const clipboardContent = await Clipboard.getStringAsync();
    const matchResult = clipboardContent.match(/pinnect:\/\/pin\/(\w+)/);
    if (matchResult == null) return;

    Alert.alert(
      "Open Pin?",
      "We noticed you have copied a Pin share link.\nWould you like to open it?",
      [
        {
          text: "Yes",
          onPress: () => {
            const pinID = matchResult[1];
            this.presentPin(pinID);
            Clipboard.setString("");
          }
        },
        {
          text: "No, thanks",
          onPress: () => Clipboard.setString("")
        }
      ]
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonGroups: {
    alignSelf: "flex-end"
  },
  sheetContainer: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 8,
    flexDirection: "row",
    flex: 1,
  }
});
