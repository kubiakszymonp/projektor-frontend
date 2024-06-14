import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Projector.css";
import { setPageTitle } from "../../services/page-title";
import { useParams } from "react-router-dom";
import { ProjectorMediaDisplay } from "./MediaDisplay";
import { ProjectorTextDisplay } from "./TextDisplay";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum, GetProjectorSettingsDto, ProjectorApi, ProjectorSettingsApi, WebrtcStreamApi } from "../../api/generated";
import zIndex from "@mui/material/styles/zIndex";
import { WebRtcStreamReciever } from "../WebRtc/web-rtc-reciever";
import { generateRandomText } from "../../util/generate-random-text";
import { useApi } from "../../services/useApi";

export const ProjectorPage: React.FC<{ isPreview: boolean }> = ({ isPreview }) => {
  const { organizationId } = useParams();
  const [displayState, setDisplayState] = useState<GetDisplayDto>();
  const [projectorSettings, setProjectorSettings] = useState<GetProjectorSettingsDto>();
  const [screenIdentifier] = useState<string>(generateRandomText());
  const { getApi } = useApi();

  const setScreenDimensions = useCallback(async () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    await getApi(ProjectorSettingsApi).projectorSettingsControllerUpdate({
      screenHeight: height,
      screenWidth: width,
    });
  }, [projectorSettings]);

  useEffect(() => {
    setPageTitle("Projektor");
    getDisplayState();
    sendScreenId();
    if (isPreview) return;
    window.addEventListener("resize", setScreenDimensions);
    return () => window.removeEventListener("resize", setScreenDimensions);
  }, []);


  const sendScreenId = async () => {
    await getApi(WebrtcStreamApi).webRtcControllerSetScreen({
      screenId: screenIdentifier
    });
  }

  const getDisplayState = async () => {
    if (!organizationId) return;
    const projectorDisplay =
      await getApi(ProjectorApi).projectorControllerGetProjectorStateByOrganizationId(
        organizationId
      );

    const projectorSettings = await getApi(ProjectorSettingsApi).projectorSettingsControllerGetSetting();

    setProjectorSettings(projectorSettings.data);
    setDisplayState(projectorDisplay.data);
  };

  useNotifyOnProjectorUpdate(getDisplayState, { organizationId, screenId: screenIdentifier });

  return (
    <>
      <div
        className="projector-container"
        style={{ backgroundColor: projectorSettings?.backgroundColor }}
      >
        {projectorSettings && (
          <>
            {displayState?.displayType === GetDisplayDtoDisplayTypeEnum.Text && (
              <ProjectorTextDisplay displayState={displayState} projectorSettings={projectorSettings} />
            )}
            {displayState?.displayType === GetDisplayDtoDisplayTypeEnum.Media && (
              <ProjectorMediaDisplay displayState={displayState} projectorSettings={projectorSettings} />
            )}
            {displayState?.displayType === GetDisplayDtoDisplayTypeEnum.WebRtc && (
              <WebRtcStreamReciever screenId={screenIdentifier} projectorState={displayState} />
            )}
          </>
        )}
      </div>
      {displayState?.emptyDisplay === true && (
        <div id="black-cover-empty-display" style={{
          zIndex: 10,
          height: "100vh",
          width: "100vw",
          position: "fixed",
          backgroundColor: projectorSettings?.backgroundColor,
          top: 0
        }}></div>
      )}
    </>
  );
};
