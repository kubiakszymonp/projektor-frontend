import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Property } from "csstype";
import "./Projector.css";
import { setPageTitle } from "../../services/page-title";
import { useParams } from "react-router-dom";
import { UPLOAD_ROOT, projectorApi, projectorSettingsApi } from "../../api";
import {
  DisplayStateDisplayTypeEnum,
  GetProjectorStateDto,
  TextStrategy,
} from "../../api/generated";
import { StreamPlayer } from "../Streamer/StreamPlayer";
import { AutoFlowText } from "../../components/auto-flow-text";

export const ProjectorPage = (props: { isPreview: boolean }) => {
  const { organizationId: rawOrganizationId } = useParams();
  const organizationId = parseInt(rawOrganizationId || "0");
  const [projectorState, setProjectorState] = useState<GetProjectorStateDto>();
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [imageStyles, setImageStyles] = useState({
    width: "100%",
    height: "100%",
  });

  useEffect(() => {
    if (!projectorState?.uploadedFile) return;
    const image = imageRef.current;
    if (!image) return;
    const { naturalWidth, naturalHeight } = image;
    const { screenWidth, screenHeight } = projectorState.settings;

    const screenRatio = screenWidth / screenHeight;
    const imageRatio = naturalWidth / naturalHeight;

    if (imageRatio <= screenRatio) {
      setImageStyles({
        width: `auto`,
        height: `100%`,
      });
    }
    if (imageRatio > screenRatio) {
      setImageStyles({
        width: `100%`,
        height: `auto`,
      });
    }
  }, [projectorState?.uploadedFile?.id, projectorState]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setPageTitle("Projektor");
  }, []);

  const setScreenDimensions = useCallback(async () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    await projectorSettingsApi.projectorSettingsControllerUpdate({
      ...projectorState!.settings,
      screenHeight: height,
      screenWidth: width,
    });
  }, [projectorState]);

  useEffect(() => {
    if (props.isPreview) return;
    window.addEventListener("resize", setScreenDimensions);
    return () => window.removeEventListener("resize", setScreenDimensions);
  }, [projectorState]);

  useEffect(() => {
    getDisplayState();
    const interval = setInterval(getLastUpdateTime, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastUpdateTime === null) return;
    if(lastUpdateTime === projectorState?.lastUpdateTime) return;
    getDisplayState();
  }, [lastUpdateTime]);

  const getDisplayState = async () => {
    const projectorDisplay =
      await projectorApi.projectorControllerGetProjectorStateByOrganizationId(
        organizationId
      );

    setProjectorState(projectorDisplay.data);
  };

  const getLastUpdateTime = async () => {
    const lastUpdate =
      await projectorApi.projectorControllerGetLastUpdateTimestamp(
        organizationId
      );
    setLastUpdateTime(lastUpdate.data);
  };

  return (
    <div
      className="projector-container"
      style={{ backgroundColor: projectorState?.settings.backgroundColor }}
    >
      {projectorState?.displayType === DisplayStateDisplayTypeEnum.Text && (
        <>
          {projectorState.settings.textStrategy !== TextStrategy.Automatic && (
            <div
              style={{
                paddingTop: projectorState?.settings.paddingTop,
                justifyContent: projectorState?.settings.textVertically,
                height: "100%",
                width: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {projectorState?.lines.map((line, index) => {
                return (
                  <div
                    key={index}
                    className="text-line"
                    style={{
                      color: projectorState?.settings.fontColor,
                      fontFamily: projectorState?.settings.fontFamily,
                      fontSize: projectorState?.settings.fontSize,
                      textAlign: projectorState?.settings
                        .textAlign as Property.TextAlign,
                      letterSpacing: projectorState?.settings.letterSpacing,
                      lineHeight: projectorState?.settings.fontSize,
                      marginInline: projectorState?.settings.marginInline,
                      marginBlock: projectorState?.settings.marginBlock,
                    }}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          )}
          {projectorState.settings.textStrategy === TextStrategy.Automatic && (
            <AutoFlowText
              settings={projectorState?.settings}
              text={projectorState.lines.join("\n")}
            />
          )}
        </>
      )}
      {projectorState?.displayType === DisplayStateDisplayTypeEnum.Media && (
        <img
          ref={imageRef}
          src={UPLOAD_ROOT + projectorState?.uploadedFile?.previewUrl}
          alt="media"
          style={{
            ...imageStyles,
            marginTop: "auto",
            marginBottom: "auto",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      )}
      {projectorState?.displayType === DisplayStateDisplayTypeEnum.Hls && (
        <StreamPlayer organizationId={organizationId} />
      )}
    </div>
  );
};
