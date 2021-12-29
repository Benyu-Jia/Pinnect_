import * as React from "react";
import { StyleSheet, View } from "react-native";
import AppText from "../../components/app-text";
import AppSwitch from "../../components/app-switch";

export default class MapFilter extends React.Component<any> {
  state = {
    visibility: [true, true, true],
    reload: true
  };

  componentDidMount() {
    const { homeState } = this.props;
    this.setState({
      visibility: homeState.visibility
    });
  }

  render() {
    const { homeSetState, update } = this.props;
    update();
    // console.info("filter:")
    // console.info(this.state.visibility)
    return (
      <View style={styles.container}>
        <View style={styles.switchcontainer}>
          <AppText style={styles.textStyle}>public pins</AppText>
          <AppSwitch
            value={this.state.visibility[0]}
            onValueChange={async () => {
              this.state.visibility[0] = !this.state.visibility[0];
              this.setState({reload: !this.state.reload})
              // this.setState({
              //   visibility: [
              //     !this.state.visibility[0],
              //     this.state.visibility[1],
              //     this.state.visibility[2]
              //   ]
              // });
              await homeSetState({
                visibility: [
                  this.state.visibility[0],
                  this.state.visibility[1],
                  this.state.visibility[2]
                ]
              });
            }}
            style={styles.switchStyle}
          />
        </View>
        <View style={styles.switchcontainer}>
          <AppText style={styles.textStyle}>friend pins</AppText>
          <AppSwitch
            value={this.state.visibility[1]}
            onValueChange={async () => {
              this.state.visibility[1] = !this.state.visibility[1];
              this.setState({reload: !this.state.reload})
              // this.setState({
              //   visibility: [
              //     this.state.visibility[0],
              //     !this.state.visibility[1],
              //     this.state.visibility[2]
              //   ]
              // });
              await homeSetState({
                visibility: [
                  this.state.visibility[0],
                  this.state.visibility[1],
                  this.state.visibility[2]
                ]
              });
            }}
            style={styles.switchStyle}
          />
        </View>
        <View style={styles.switchcontainer}>
          <AppText style={styles.textStyle}>private pins</AppText>
          <AppSwitch
            value={this.state.visibility[2]}
            onValueChange={async () => {
              this.state.visibility[2] = !this.state.visibility[2];
              this.setState({reload: !this.state.reload})
              // this.setState({
              //   visibility: [
              //     this.state.visibility[0],
              //     this.state.visibility[1],
              //     !this.state.visibility[2]
              //   ]
              // });
              await homeSetState({
                visibility: [
                  this.state.visibility[0],
                  this.state.visibility[1],
                  this.state.visibility[2]
                ]
              });
            }}
            style={styles.switchStyle}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column"
  },
  switchcontainer: {
    flexDirection: "row"
  },
  textStyle: {
    flex: 1,
    fontSize: 20,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 20
  },
  switchStyle: {}
});
