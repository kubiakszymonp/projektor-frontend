import { Box, Card, Checkbox, FormControlLabel, Typography } from "@mui/material";
import React, { RefObject, useEffect, useMemo, useState } from "react";
import { OnPreviewClickHandler } from "./OnPreviewClick";
import { DisplayStateApi, GetDisplayDto, GetDisplayQueueDto, GetDisplayStateDto, GetTextUnitDto, MovePageDtoDirectionEnum, TextUnitsApi } from "../../api/generated";
import { OrderedParsedTextUnit, ParsedTextUnit } from "text-parser";
import { useApi } from "../../services/useApi";

export const TextController: React.FC<{
    displayState: GetDisplayStateDto,
    previewRef: RefObject<HTMLDivElement>
}> =
    ({ displayState, previewRef }) => {
        const [textUnit, setTextUnit] = useState<GetTextUnitDto>();
        const [displayQueue, setDisplayQueue] =
            useState<GetDisplayQueueDto>();
        const { getApi } = useApi();

        const currentSongParsed = useMemo(() => {
            if (!textUnit) return null;
            const order = textUnit.partsOrder?.split(",").map((part) => parseInt(part));
            return new OrderedParsedTextUnit(textUnit.content, order ?? []);
        }, [textUnit]);

        useEffect(() => {
            loadState();
        }, [displayState]);

        const loadState = () => {
            fetchTextUnit(displayState.textUnitId);
        }

        const fetchTextUnit = async (id: string) => {
            const textUnit = await getApi(TextUnitsApi).textUnitControllerFindOne(id.toString());
            setTextUnit(textUnit.data);
        };

        const selectTextUnitPart = async (index: number) => {
            await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
                textUnitId: displayState.textUnitId,
                textUnitPart: index,
                textUnitPartPage: 0,
            });
        };

        const movePage = async (direction: MovePageDtoDirectionEnum) => {
            await getApi(DisplayStateApi).displayStateControllerMovePage({
                direction,
            });
        };

        return (
            <>
                <OnPreviewClickHandler previewRef={previewRef} movePage={movePage} />
                <Box>
                    <Typography variant="h4">{textUnit?.title}</Typography>
                    {currentSongParsed?.orderedTextUnitParts.map((part, index: number) => {
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