import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { LoginPage } from "./pages/Login/Login";
import { ThemeProvider, createTheme } from "@mui/material";
import { ProjectorPage } from "./pages/Projector/Projector";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { TextUnitList } from "./pages/TextUnits/TextUnitList";
import { Controller } from "./pages/Controller/DisplayController";
import { DisplaySettings } from "./pages/Settings/DisplaySettings";
import { TextUnitQueueList } from "./pages/TextUnitQueues/TextUnitQueueList";
import { FilesManager } from "./pages/FilesManager/FilesManager";
import { LoadingSpinner } from "./components/loading-spinner";
import { LoadingProvider } from "./components/loading/loading-context";
import { WebRtcStream } from "./pages/WebRtc/web-rtc-sender";
import MediaCaptureProvider from "./services/user-media-capture.provider";
import { WebRtcStreamReciever } from "./pages/WebRtc/web-rtc-reciever";
import { ControllerSettings } from "./pages/ControllerSettings/controller-settings";
import { ServerProvider } from "./services/api-server-context";
import { TagList } from "./pages/TagManagement/tag-list";
import { ApiProvider } from "./services/useApi";
import { AutoLoginProjectorPage } from "./pages/Projector/AutoLoginProjector";
import { UserList } from "./pages/UsersManagement/user-list";
import { Synchronization } from "./pages/Synchronization/synchronization";

function App() {
  const defaultTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });
  return (
    <ThemeProvider theme={defaultTheme}>
      <ServerProvider>
        <ApiProvider>
          <MediaCaptureProvider>
            <LoadingProvider>
              <LoadingSpinner />

              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/text-unit-list" element={<TextUnitList />} />
                <Route path="/display-settings" element={<DisplaySettings />} />
                <Route path="/display-controller" element={<Controller />} />
                <Route path="/text-unit-queue-list" element={<TextUnitQueueList />} />
                <Route
                  path="/projector/:organizationId"
                  element={<ProjectorPage isPreview={false} />}
                />
                <Route
                  path="/projector/:email/:password"
                  element={<AutoLoginProjectorPage isPreview={false} />}
                />
                <Route
                  path="/projector-preview/:organizationId"
                  element={<ProjectorPage isPreview={true} />}
                />
                <Route path="/files-manager" element={<FilesManager />} />
                <Route path="/stream" element={<WebRtcStream />} />
                <Route path="/synchronization" element={<Synchronization />} />
                <Route path="/tag-list" element={<TagList />} />
                <Route path="/users-management" element={<UserList />} />
              </Routes>
            </LoadingProvider>
          </MediaCaptureProvider>
        </ApiProvider>
      </ServerProvider>
    </ThemeProvider>
  );
}

export default App;

