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
import { io } from "socket.io-client";

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
    if (props.isPreview) return;
    window.addEventListener("resize", setScreenDimensions);
    return () => window.removeEventListener("resize", setScreenDimensions);
  }, []);

  useEffect(() => {
    getDisplayState();
    const socket = io("ws://localhost:81", {
      query: { organizationId },
    });

    socket.on("changed", () => {
      getDisplayState();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getDisplayState = async () => {
    const projectorDisplay =
      await projectorApi.projectorControllerGetProjectorStateByOrganizationId(
        organizationId
      );

    setProjectorState(projectorDisplay.data);
  };

  return (
    <div
      className="projector-container"
      style={{ backgroundColor: projectorState?.settings.backgroundColor }}
    >
      {projectorState?.displayType === DisplayStateDisplayTypeEnum.Text && (
        <ProjectorTextDisplay projectorState={projectorState} />
      )}
      {projectorState?.displayType === DisplayStateDisplayTypeEnum.Media && (
        <ProjectorMediaDisplay projectorState={projectorState} />
      )}
      {projectorState?.displayType === DisplayStateDisplayTypeEnum.Hls && (
        <StreamPlayer organizationId={organizationId} />
      )}
    </div>
  );
};
