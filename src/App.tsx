import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
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
import { WebRtcStreamSender } from "./pages/WebRtc/WebRtcStreamSender";
import { WebRtcStream } from "./pages/WebRtc/web-rtc-signaling";

function App() {
  const defaultTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });
  return (
    <ThemeProvider theme={defaultTheme}>
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
            path="/projector-preview/:organizationId"
            element={<ProjectorPage isPreview={true} />}
          />
          <Route path="/files-manager" element={<FilesManager />} />
          <Route path="/stream" element={<WebRtcStream />} />
        </Routes>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;
