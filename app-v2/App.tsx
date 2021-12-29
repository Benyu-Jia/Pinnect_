import React from "react";
import { GlobalContextProvider } from "./src/contexts/global-state";
import Pinnect from "./src/Pinnect";

export default function App() {
  return (
    <GlobalContextProvider>
      <Pinnect />
    </GlobalContextProvider>
  );
}
