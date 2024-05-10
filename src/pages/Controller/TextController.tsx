import { Box, Card, Checkbox, FormControlLabel, Typography } from "@mui/material";
import React, { RefObject, useEffect, useMemo, useState } from "react";
import { Song } from "song-parser";
import { DisplayState, MovePageDtoDirectionEnum, TextUnitDto, TextUnitQueueDto } from "../../api/generated";
import { displayStateApi, textUnitApi, textUnitQueuesApi } from "../../api";
import { OnPreviewClickHandler } from "./OnPreviewClick";

export const TextController: React.FC<{
    currentDisplayState: DisplayState,
    previewRef: RefObject<HTMLDivElement>
}> =
    ({ currentDisplayState, previewRef }) => {

        const [currentTextUnit, setCurrentTextUnit] = useState<TextUnitDto>();
        const [currentTextUnitQueue, setCurrentTextUnitQueue] =
            useState<TextUnitQueueDto>();

        const currentSongParsed = useMemo(() => {
            if (!currentTextUnit) return null;
            return new Song(currentTextUnit?.content || "");
        }, [currentTextUnit]);

        useEffect(() => {
            loadState();
        });

        const loadState = async () => {
            fetchCurrentTextUnit();
            fetchCurrentQueue();
        }

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

        const fetchCurrentTextUnit = async () => {
            const textUnit = await textUnitApi.textUnitControllerGetCurrentTextUnit();
            setCurrentTextUnit(textUnit.data);
        };

        const fetchCurrentQueue = async () => {
            const queue =
                await textUnitQueuesApi.textUnitQueuesControllerGetCurrentTextUnitQueue();
            setCurrentTextUnitQueue(queue.data);
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

        const movePage = async (direction: MovePageDtoDirectionEnum) => {
            await displayStateApi.displayStateControllerMovePage({
                direction,
            });
        };

        return (
            <>
                <OnPreviewClickHandler previewRef={previewRef} movePage={movePage} />
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
                    {currentDisplayState && (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={currentDisplayState.emptyDisplay}
                                    sx={{ "& .MuiSvgIcon-root": { fontSize: 32 } }}
                                />
                            }
                            label="Wygaś ekran"
                            onChange={(_, checked) => {
                                setScreenOnOff(checked);
                            }}
                        />
                    )}
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
        )
    }