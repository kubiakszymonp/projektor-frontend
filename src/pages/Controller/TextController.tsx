import { Box, Card, Checkbox, FormControlLabel, Typography } from "@mui/material";
import React, { RefObject, useEffect, useMemo, useState } from "react";
import { displayStateApi, textUnitApi, textUnitQueuesApi } from "../../api";
import { OnPreviewClickHandler } from "./OnPreviewClick";
import { GetDisplayDto, GetDisplayQueueDto, GetDisplayStateDto, GetTextUnitDto, MovePageDtoDirectionEnum } from "../../api/generated";
import { ParsedTextUnit } from "text-parser";

export const TextController: React.FC<{
    displayState: GetDisplayStateDto,
    previewRef: RefObject<HTMLDivElement>
}> =
    ({ displayState, previewRef }) => {

        const [textUnit, setTextUnit] = useState<GetTextUnitDto>();
        const [displayQueue, setDisplayQueue] =
            useState<GetDisplayQueueDto>();

        const currentSongParsed = useMemo(() => {
            if (!textUnit) return null;
            return new ParsedTextUnit(textUnit.content);
        }, [textUnit]);

        useEffect(() => {
            loadState();
        }, []);

        const loadState = () => {
            fetchTextUnit(displayState.textUnitId);
            fetchQueue(displayState.textUnitQueueId);
        }

        const currentTextUnitQueueIsNotEmpty = () => {
            return displayQueue?.queueTextUnits?.length;
        };

        const setCurrentTextUnitRequest = async (textUnitId: number) => {
            await displayStateApi.displayStateControllerUpdateDisplayState({
                textUnitId: textUnitId,
                textUnitPart: 0,
                textUnitPartPage: 0,
            });
            await loadState();
        };

        const fetchTextUnit = async (id: number) => {
            const textUnit = await textUnitApi.textUnitControllerFindOne(id.toString());
            setTextUnit(textUnit.data);
        };

        const fetchQueue = async (id: number) => {
            const queue = await textUnitQueuesApi.displayQueuesControllerFindOne(id.toString());
            setDisplayQueue(queue.data);
        };

        const setScreenOnOff = async (off: boolean) => {
            await displayStateApi.displayStateControllerUpdateDisplayState({
                emptyDisplay: off,
            })
            await loadState();
        };

        const selectTextUnitPart = async (index: number) => {
            await displayStateApi.displayStateControllerUpdateDisplayState({
                textUnitId: displayState.textUnitId,
                textUnitPart: index,
                textUnitPartPage: 0,
            });
            await loadState();
        };

        const movePage = async (direction: MovePageDtoDirectionEnum) => {
            await displayStateApi.displayStateControllerMovePage({
                direction,
            });

            loadState();
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
                    <Typography variant="h4">{textUnit?.title}</Typography>
                    {currentSongParsed?.parsedTextUnitParts.map((part, index: number) => {
                        return (
                            <Card
                                key={index}
                                onClick={() => selectTextUnitPart(index)}
                                sx={{
                                    my: 1,
                                    p: 1,
                                    backgroundColor:
                                        displayState?.textUnitPart === index
                                            ? "#2e3133"
                                            : "#06090a",
                                }}
                            >
                                <Typography variant="h5">{part.explicitLabel ?? part.defaultLabel}</Typography>
                            </Card>
                        );
                    })}
                    {displayState && (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={displayState.emptyDisplay}
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
                        <Typography variant="h5">{displayQueue?.name}</Typography>
                        {!currentTextUnitQueueIsNotEmpty() && (
                            <Typography>[Brak tekstów]</Typography>
                        )}
                        {displayQueue?.queueTextUnits?.map((queueTextUnit, index) => {
                            return (
                                <Card
                                    key={index}
                                    onClick={() => setCurrentTextUnitRequest(queueTextUnit.id)}
                                    sx={{
                                        my: 1,
                                        p: 1,
                                        backgroundColor:
                                            displayState?.textUnitId === queueTextUnit.id
                                                ? "#2e3133"
                                                : "#06090a",
                                    }}
                                >
                                    <Typography variant="h5">{queueTextUnit.textTitle}</Typography>
                                </Card>
                            );
                        })}
                    </Box>
                </Box>
            </>
        )
    }