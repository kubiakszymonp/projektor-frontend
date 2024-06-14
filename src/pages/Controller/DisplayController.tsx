import React, { useEffect, useMemo, useRef, useState } from "react";
import { AutoscalingIframe } from "../../components/autoscaling-iframe";

import { jwtPersistance } from "../../services/jwt-persistance";
import { useLoading } from "../../components/loading/loading-context";
import { TextController } from "./TextController";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import {
  DisplayStateApi,
  GetDisplayDto,
  GetDisplayDtoDisplayTypeEnum,
  GetDisplayStateDto,
  GetProjectorSettingsDto,
  ProjectorSettingsApi,
} from "../../api/generated";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionSummary, AccordionDetails, Grid, Typography } from "@mui/material";
import { GeneralDisplayController } from "./GeneralDisplayController";
import { DisplayQueuesController } from "./DisplayQueuesController";
import { useMediaQuery, useTheme } from "@mui/material";
import { useApi } from "../../services/useApi";

export const Controller = () => {
  const [displayState, setDisplayState] = useState<GetDisplayStateDto>();
  const [projectorSettings, setProjectorSettings] = useState<GetProjectorSettingsDto>();
  const { setLoading } = useLoading();
  const previewRef = useRef<HTMLDivElement>(null);
  const organizationId = useMemo(
    () => jwtPersistance.getDecodedJwt()?.organizationId,
    []
  );
  const gridElementRef = useRef<HTMLDivElement>(null);
  const { getApi } = useApi();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  const calculateDesiredWidth = () => {
    if (isXs) {
      return window.innerWidth; // Full width for extra small screens
    } else if (isMd) {
      return window.innerWidth / 2 - 16; // Half width for medium and larger screens
    } else {
      return window.innerWidth; // Default to full width for other cases
    }
  };

  useEffect(() => {
    //setLoading(true);
    loadState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadState = async () => {
    fetchDisplayState();
    fetchProjectorSettings();
  };

  useNotifyOnProjectorUpdate(loadState, { organizationId });

  const fetchDisplayState = async () => {
    const state = await getApi(DisplayStateApi).displayStateControllerGetDisplayState();
    setDisplayState(state.data);
  };

  const fetchProjectorSettings = async () => {
    const settings =
      await getApi(ProjectorSettingsApi).projectorSettingsControllerGetSetting();
    setProjectorSettings(settings.data);
  };

  const calc = () => {
    if (gridElementRef.current) {
      return gridElementRef.current.clientWidth - 16;
    }
    return 0;
  }


  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#101010",
        minHeight: "100vh",
      }}
    >
      <Grid container spacing={2} >
        <Grid item xs={12} md={6} ref={gridElementRef} sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <AutoscalingIframe
            onLoad={() => {
              setTimeout(() => {
                setLoading(false);
              }, 300);
            }}
            ref={previewRef}
            desiredWidth={calc()}
            originalHeight={projectorSettings?.screenHeight || 0}
            originalWidth={projectorSettings?.screenWidth || 0}
            url={"/projector-preview/" + jwtPersistance.getDecodedJwt()?.organizationId}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Accordion disableGutters sx={{}} defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Ustawienia pieśni
            </AccordionSummary>
            <AccordionDetails>
              {displayState && (
                <TextController displayState={displayState} previewRef={previewRef} />
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12} md={6}>
          <Accordion disableGutters sx={{}} defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              Ustawienia kolejki
            </AccordionSummary>
            <AccordionDetails>
              {displayState && (
                <DisplayQueuesController displayState={displayState} />
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12} md={6}>
          <Accordion disableGutters sx={{}} defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              Typ treści
            </AccordionSummary>
            <AccordionDetails>
              {displayState && (
                <GeneralDisplayController displayState={displayState} />
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </div>
  );
};
