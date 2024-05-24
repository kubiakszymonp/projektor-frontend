
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AutoscalingIframe } from "../../components/autoscaling-iframe";

import { jwtPersistance } from "../../services/jwt-persistance";
import {
  displayStateApi,
  projectorSettingsApi,
} from "../../api";
import { useLoading } from "../../components/loading/loading-context";
import { TextController } from "./TextController";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum, GetDisplayStateDto, GetProjectorSettingsDto } from "../../api/generated";
import { io } from "socket.io-client";
import { environment } from "../../environment";


export const Controller = () => {
  const [projectorSettings, setProjectorSettings] =
    React.useState<GetProjectorSettingsDto>();
  const [displayState, setDisplayState] =
    React.useState<GetDisplayStateDto>();
  const { setLoading } = useLoading();
  const previewRef = useRef<HTMLDivElement>(null);
  const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);

  useEffect(() => {
    setLoading(true);
    loadState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadState = async () => {
    fetchDisplayState();
    fetchProjectorSettings();
  };

  useNotifyOnProjectorUpdate(loadState, String(organizationId));

  const fetchDisplayState = async () => {
    const state = await displayStateApi.displayStateControllerGetDisplayState();
    setDisplayState(state.data);
  };

  const fetchProjectorSettings = async () => {
    const settings =
      await projectorSettingsApi.projectorSettingsControllerGetSetting();
    setProjectorSettings(settings.data);
  };

  return (
    <div style={{ position: "relative" }}>
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
      {displayState?.displayType === GetDisplayDtoDisplayTypeEnum.Text && (
        <TextController displayState={displayState} previewRef={previewRef} />
      )}
    </div>
  );
};


