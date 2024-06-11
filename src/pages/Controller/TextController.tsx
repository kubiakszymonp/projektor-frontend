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
        }, [displayState]);

        const loadState = () => {
            fetchTextUnit(displayState.textUnitId);
        }

        const fetchTextUnit = async (id: string) => {
            const textUnit = await textUnitApi.textUnitControllerFindOne(id.toString());
            setTextUnit(textUnit.data);
        };

        const selectTextUnitPart = async (index: number) => {
            await displayStateApi.displayStateControllerUpdateDisplayState({
                textUnitId: displayState.textUnitId,
                textUnitPart: index,
                textUnitPartPage: 0,
            });
        };

        const movePage = async (direction: MovePageDtoDirectionEnum) => {
            await displayStateApi.displayStateControllerMovePage({
                direction,
            });
        };

        return (
            <>
                <OnPreviewClickHandler previewRef={previewRef} movePage={movePage} />
                <Box>
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
                </Box>
            </>
        )
    }