import React from "react";
import * as SocketIO from "socket.io-client";
import Home from "../screens/home/home";

type GlobalStateType = {
  session: string | null;
  username: string | null;
  preferences: {
    darkMode: boolean;
  };
  homeScreenRef: React.RefObject<Home>;
  socketClient: SocketIO.Socket | null;
  messages: {
    [key: string]: { username: string; message: string; timestamp: number }[];
  };
  refreshProfile: boolean;
};

type GlobalContext = {
  state: GlobalStateType;
  setState: Function;
};

export { GlobalStateType, GlobalContext };

const Context = React.createContext<GlobalContext>({
  state: {
    session: null,
    username: null,
    preferences: {
      darkMode: false
    },
    homeScreenRef: React.createRef<Home>(),
    socketClient: null,
    messages: {},
    refreshProfile: false
  },
  setState: () => {
    throw "";
  }
});

export default Context;

export class GlobalContextProvider extends React.Component {
  state = {
    session: null,
    username: null,
    //session: "6074f7f1c01f6afa242dcffd",
    //username: "tester",
    preferences: {
      darkMode: false
    },
    homeScreenRef: React.createRef<Home>(),
    socketClient: null,
    messages: {},
    refreshProfile: false
  };

  stateRef = React.createRef<GlobalStateType>();

  constructor(props: any) {
    super(props);
    this.setState = this.setState.bind(this);
  }

  render() {
    return (
      <Context.Provider value={{ state: this.state, setState: this.setState }}>
        {this.props.children}
      </Context.Provider>
    );
  }
}
