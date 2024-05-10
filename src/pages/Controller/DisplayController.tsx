
import React, { useEffect, useRef, useState } from "react";
import { AutoscalingIframe } from "../../components/autoscaling-iframe";

import { jwtPersistance } from "../../services/jwt-persistance";
import {
  displayStateApi,
  projectorSettingsApi,
} from "../../api";
import {
  DisplayState,
  DisplayStateDisplayTypeEnum,
  ProjectorSettingsConfigurationDto,
} from "../../api/generated";
import { useLoading } from "../../components/loading/loading-context";
import { TextController } from "./TextController";

export const Controller = () => {
  const [projectorSettings, setProjectorSettings] =
    React.useState<ProjectorSettingsConfigurationDto>();
  const [currentDisplayState, setCurrentDisplayState] =
    React.useState<DisplayState>();
  const { setLoading } = useLoading();

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    loadState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const loadState = async () => {
    fetchDisplayState();
    fetchProjectorSettings();
  };

  const fetchDisplayState = async () => {
    const state = await displayStateApi.displayStateControllerGetDisplayState();
    setCurrentDisplayState(state.data);
  };

  const fetchProjectorSettings = async () => {
    const settings =
      await projectorSettingsApi.projectorSettingsControllerGetSetting();
    setProjectorSettings(settings.data);
  };

  return (
    <>
      <AutoscalingIframe
        onLoad={() => {
          setTimeout(() => {
            setLoading(false);
          }, 300);
        }}
        ref={previewRef}
        desiredHeight={window.innerHeight}
        desiredWidth={window.innerWidth}
        originalHeight={projectorSettings?.screenHeight || 0}
        originalWidth={projectorSettings?.screenWidth || 0}
        url={"/projector-preview/" + jwtPersistance.getDecodedJwt()?.id}
      />
      {currentDisplayState?.displayType === DisplayStateDisplayTypeEnum.Text && (
        <TextController currentDisplayState={currentDisplayState} previewRef={previewRef} />
      )}
    </>
  );
};


