import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store/store";
import RootNavigator from "./src/navigation/RootNavigator";

import { useShareListener } from "./src/share/useShareListener";
import { navigate, navigationRef } from "./src/navigation/NavigationService";

import {
  addSharedFilesGlobal,
} from "./src/share/ShareState";

const App = () => {

  useShareListener((files) => {
    console.log("🔥 Share received in App:", files);

    if (!files || files.length === 0) return;

    // 1️⃣ If navigation is NOT ready → store files globally (cold start)
    if (!navigationRef.isReady()) {
      console.log("📌 Navigation NOT ready → storing globally");
      addSharedFilesGlobal(files);
      return;
    }

    // 2️⃣ Navigation ready → route directly to FileUpload
    console.log("📌 Navigation ready → navigating to FileUpload");
    navigate("Main", {
      screen: "Home",
      params: {
        screen: "FileUpload",
        params: { sharedFiles: files }
      }
    });
  });

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        }
        persistor={persistor}
      >
        <RootNavigator />
      </PersistGate>
    </Provider>
  );
};

export default App;
