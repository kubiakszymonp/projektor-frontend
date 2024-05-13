import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Projector.css";
import { setPageTitle } from "../../services/page-title";
import { useParams } from "react-router-dom";
import { projectorApi, projectorSettingsApi } from "../../api";
import {
  DisplayStateDisplayTypeEnum,
  GetProjectorStateDto,
} from "../../api/generated";
import { StreamPlayer } from "../Streamer/StreamPlayer";
import { ProjectorMediaDisplay } from "./MediaDisplay";
import { ProjectorTextDisplay } from "./TextDisplay";
import { useNotifyOrganizationEdit } from "../../services/useNofifyOrganizationEdit";

export const ProjectorPage = (props: { isPreview: boolean }) => {
  const { organizationId: rawOrganizationId } = useParams();
  const organizationId = parseInt(rawOrganizationId || "0");
  const [projectorState, setProjectorState] = useState<GetProjectorStateDto>();

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
  }, [projectorState]);

  useEffect(() => {
    getDisplayState();
    if (props.isPreview) return;
    window.addEventListener("resize", setScreenDimensions);
    return () => window.removeEventListener("resize", setScreenDimensions);
  }, []);

  const getDisplayState = async () => {
    const projectorDisplay =
      await projectorApi.projectorControllerGetProjectorStateByOrganizationId(
        organizationId
      );

    setProjectorState(projectorDisplay.data);
  };

  useNotifyOrganizationEdit(getDisplayState, String(organizationId));

  return (
    <div
      className="projector-container"
      style={{ backgroundColor: projectorState?.settings.backgroundColor }}
    >
      {projectorState?.emptyDisplay === false && (
        <>
          {projectorState?.displayType === DisplayStateDisplayTypeEnum.Text && (
            <ProjectorTextDisplay projectorState={projectorState} />
          )}
          {projectorState?.displayType === DisplayStateDisplayTypeEnum.Media && (
            <ProjectorMediaDisplay projectorState={projectorState} />
          )}
          {projectorState?.displayType === DisplayStateDisplayTypeEnum.Hls && (
            <StreamPlayer organizationId={organizationId} />
          )}
        </>
      )}
    </div>
  );
};
