import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Projector.css";
import { setPageTitle } from "../../services/page-title";
import { useParams } from "react-router-dom";
import { projectorApi, projectorSettingsApi, webRtcStreamApi } from "../../api";
import { ProjectorMediaDisplay } from "./MediaDisplay";
import { ProjectorTextDisplay } from "./TextDisplay";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum, GetProjectorSettingsDto } from "../../api/generated";
import zIndex from "@mui/material/styles/zIndex";
import { WebRtcStreamReciever } from "../WebRtc/web-rtc-reciever";
import { generateRandomText } from "../../util/generate-random-text";

export const ProjectorPage = (props: { isPreview: boolean }) => {
  const { organizationId: rawOrganizationId } = useParams();
  const organizationId = parseInt(rawOrganizationId || "0");
  const [displayState, setDisplayState] = useState<GetDisplayDto>();
  const [projectorSettings, setProjectorSettings] = useState<GetProjectorSettingsDto>();
  const [screenIdentifier] = useState<string>(generateRandomText());

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setPageTitle("Projektor");
  }, []);

  const setScreenDimensions = useCallback(async () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    await projectorSettingsApi.projectorSettingsControllerUpdate({
      screenHeight: height,
      screenWidth: width,
    });
  }, [projectorSettings]);

  useEffect(() => {
    getDisplayState();
    sendScreenId();
    if (props.isPreview) return;
    window.addEventListener("resize", setScreenDimensions);
    return () => window.removeEventListener("resize", setScreenDimensions);
  }, []);


  const sendScreenId = async () => {
    await webRtcStreamApi.webRtcControllerSetScreen({
      screenId: screenIdentifier
    });
  }

  const getDisplayState = async () => {
    const projectorDisplay =
      await projectorApi.projectorControllerGetProjectorStateByOrganizationId(
        organizationId
      );

    const projectorSettings = await projectorSettingsApi.projectorSettingsControllerGetSetting();

    setProjectorSettings(projectorSettings.data);
    setDisplayState(projectorDisplay.data);
  };

  useNotifyOnProjectorUpdate(getDisplayState, { organizationId });

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
