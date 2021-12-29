import { useNavigation } from "@react-navigation/core";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import FontistoIcon from "react-native-vector-icons/Fontisto";

import AppText from "../../components/app-text";
import Pin from "../../components/pin/pin";
import Context from "../../contexts/global-state";
import { fetchAPI } from "../../helpers/fetch";
import { getCurrentLocation } from "../../helpers/location";
import { DEFAULT_LAT_DELTA, DEFAULT_LNG_DELTA } from "../home/home";

const DiscoverScreen = React.memo(() => {
  const context = useContext(Context);
  const navigator = useNavigation();

  return (
    <View>
      <Discover
        session={context.state.session}
        username={context.state.username}
        onPress={async (pinData) => {
          navigator.navigate("Home");
          const homeScreen = context.state.homeScreenRef.current;
          homeScreen?.mapRef.current.animateToRegion(
            {
              longitude: pinData.location.coordinates[0],
              latitude: pinData.location.coordinates[1],
              longitudeDelta: DEFAULT_LNG_DELTA,
              latitudeDelta: DEFAULT_LAT_DELTA
            },
            200
          );
          await new Promise((resolve) => setTimeout(resolve, 100));
          homeScreen?.mapRef.current.animateToRegion(
            {
              longitude: pinData.location.coordinates[0],
              latitude: pinData.location.coordinates[1],
              longitudeDelta: DEFAULT_LNG_DELTA * 0.5,
              latitudeDelta: DEFAULT_LAT_DELTA * 0.5
            },
            200
          );
          await new Promise((resolve) => setTimeout(resolve, 100));
          homeScreen?.presentPin(pinData._id);
        }}
      />
    </View>
  );
});

export default DiscoverScreen;

const Discover = React.memo(
  (props: {
    session: string | null;
    username: string | null;
    onPress: (pinData: any) => void;
  }) => {
    const [pins, setPins] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [noMore, setNoMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadPins = useCallback(async (oldData: string[], page: number) => {
      const location = await getCurrentLocation();
      const result = await fetchAPI("discover", "POST", {
        longitude: location?.coords.longitude,
        latitude: location?.coords.latitude,
        page: page
      });
      if (result.data.error != 0) {
        showMessage({ message: result.data.message, type: "danger" });
        return;
      }
      const newData = result.data.data;
      if (newData.length == 0) {
        setNoMore(true);
        return;
      }
      setPins([...oldData, ...newData]);
    }, []);

    const refresh = useCallback(async () => {
      setRefreshing(true);
      setPins([]);
      setPage(0);
      setNoMore(false);
      await loadPins([], 0);
      setRefreshing(false);
    }, []);

    useEffect(() => {
      setPins([]);
      setPage(0);
      setNoMore(false);
      loadPins(pins, page);
    }, []);

    if (pins == null) {
      return null;
    }

    if (pins.length == 0) {
      return (
        <ScrollView
          contentContainerStyle={styles.noMomentsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
        >
          <FontistoIcon name="wink" size={36} style={styles.noMomentsText} />
          <AppText style={styles.noMomentsText}>Nothing here yet...</AppText>
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={pins}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.pinContainer} key={index}>
            <Pin
              pinID={item}
              session={props.session}
              username={props.username}
              withCommentsAndReply={true}
              onPress={props.onPress}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        onEndReached={() => {
          if (!noMore) {
            loadPins(pins, page + 1);
            setPage(page + 1);
          }
        }}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  logoutContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  logoutPrompt: {
    color: "gray"
  },
  noMomentsContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  noMomentsText: {
    color: "gray",
    padding: 4,
    marginBottom: 16
  },
  pinContainer: {
    backgroundColor: "white",
    marginLeft: 8,
    marginTop: 8,
    marginRight: 8,
    padding: 16,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 224,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      height: 0,
      width: 0
    }
  }
});
