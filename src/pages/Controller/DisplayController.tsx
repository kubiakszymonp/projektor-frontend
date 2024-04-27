import {
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AutoscalingIframe } from "../../components/autoscaling-iframe";
import { Song } from "song-parser";
import { jwtPersistance } from "../../services/jwt-persistance";
import {
  displayStateApi,
  projectorSettingsApi,
  textUnitApi,
  textUnitQueuesApi,
} from "../../api";
import {
  DisplayState,
  DisplayStateDisplayTypeEnum,
  MovePageDtoDirectionEnum,
  ProjectorSettingsConfigurationDto,
  TextUnitDto,
  TextUnitQueueDto,
} from "../../api/generated";
import { useLoading } from "../../components/loading/loading-context";

export const Controller = () => {
  const [projectorSettings, setProjectorSettings] =
    React.useState<ProjectorSettingsConfigurationDto>();
  const [currentTextUnit, setCurrentTextUnit] = React.useState<TextUnitDto>();
  const [currentTextUnitQueue, setCurrentTextUnitQueue] =
    React.useState<TextUnitQueueDto>();
  const [currentDisplayState, setCurrentDisplayState] =
    React.useState<DisplayState>();
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  const { setLoading } = useLoading();

  const currentSongParsed = useMemo(() => {
    if (!currentTextUnit) return null;
    return new Song(currentTextUnit?.content || "");
  }, [currentTextUnit]);

  useEffect(() => {
    setLoading(true);
    loadState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (componentRef.current) {
      setDimensions({
        width: componentRef.current.offsetWidth,
        height: componentRef.current.offsetHeight,
      });
    }
  }, [iframeLoaded]);

  const loadState = async () => {
    fetchDisplayState();
    fetchCurrentTextUnit();
    fetchCurrentQueue();
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

  const fetchCurrentTextUnit = async () => {
    const textUnit = await textUnitApi.textUnitControllerGetCurrentTextUnit();
    setCurrentTextUnit(textUnit.data);
  };

  const fetchCurrentQueue = async () => {
    const queue =
      await textUnitQueuesApi.textUnitQueuesControllerGetCurrentTextUnitQueue();
    setCurrentTextUnitQueue(queue.data);
  };

  const movePage = async (direction: MovePageDtoDirectionEnum) => {
    await displayStateApi.displayStateControllerMovePage({
      direction,
    });
    await loadState();
  };

  const setScreenOnOff = async (off: boolean) => {
    await displayStateApi.displayStateControllerUpdateDisplayState({
      emptyDisplay: off,
    });
    await loadState();
  };

  const selectTextUnitPart = async (index: number) => {
    await displayStateApi.displayStateControllerUpdateDisplayState({
      textState: {
        textUnitId: currentDisplayState!.textState.textUnitId,
        textUnitPart: index,
        textUnitPartPage: 0,
      },
    });
    await loadState();
  };

  const currentTextUnitQueueIsNotEmpty = () => {
    if (!currentTextUnitQueue) return false;
    if (!currentTextUnitQueue.content) return false;
    if (!currentTextUnitQueue.content.textUnits) return false;
    return currentTextUnitQueue.content.textUnits.length > 0;
  };

  const setCurrentTextUnitRequest = async (textUnitId: number) => {
    await textUnitApi.textUnitControllerSetCurrentTextUnit({
      id: textUnitId,
    });
    await loadState();
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          position: "absolute",
          color: "red",
          zIndex: 50,
          height: dimensions.height,
        }}
      >
        <div
          style={{ flex: 1 }}
          onClick={() => {
            movePage(MovePageDtoDirectionEnum.Previous);
          }}
        ></div>
        <div
          style={{ flex: 1 }}
          onClick={() => {
            movePage(MovePageDtoDirectionEnum.Next);
          }}
        ></div>
      </div>
      <AutoscalingIframe
        onLoad={() => {
          setIframeLoaded(true);
          setTimeout(() => {
            setLoading(false);
          }, 300);
        }}
        ref={componentRef}
        desiredHeight={window.innerHeight}
        desiredWidth={window.innerWidth}
        originalHeight={projectorSettings?.screenHeight || 0}
        originalWidth={projectorSettings?.screenWidth || 0}
        url={"/projector-preview/" + jwtPersistance.getDecodedJwt()?.id}
      />
      <Box
        sx={{
          py: 3,
          px: 5,
          color: "white",
          bgcolor: "#06090a",
          height: " 100%",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h4">{currentTextUnit?.title}</Typography>
        {currentSongParsed?.songParts.map((part, index: number) => {
          return (
            <Card
              key={index}
              onClick={() => selectTextUnitPart(index)}
              sx={{
                my: 1,
                p: 1,
                backgroundColor:
                  currentDisplayState?.textState.textUnitPart === index
                    ? "#2e3133"
                    : "#06090a",
              }}
            >
              <Typography variant="h5">{part.songPartName}</Typography>
            </Card>
          );
        })}
        <FormControlLabel
          control={
            <Checkbox
              checked={currentDisplayState?.emptyDisplay}
              sx={{ "& .MuiSvgIcon-root": { fontSize: 32 } }}
            />
          }
          label="Wygaś ekran"
          onChange={(_, checked) => {
            setScreenOnOff(checked);
          }}
        />
        <Box>
          <Typography variant="h5">{currentTextUnitQueue?.name}</Typography>
          {!currentTextUnitQueueIsNotEmpty() && (
            <Typography>[Brak tekstów]</Typography>
          )}
          {currentTextUnitQueue?.content?.textUnits.map((textUnit, index) => {
            return (
              <Card
                key={index}
                onClick={() => setCurrentTextUnitRequest(textUnit.id)}
                sx={{
                  my: 1,
                  p: 1,
                  backgroundColor:
                    currentDisplayState?.textState.textUnitId === textUnit.id
                      ? "#2e3133"
                      : "#06090a",
                }}
              >
                <Typography variant="h5">{textUnit.title}</Typography>
              </Card>
            );
          })}
        </Box>
      </Box>
    </>
  );
};
