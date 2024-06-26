import { Box, Typography, Card } from "@mui/material";
import { useEffect, useState } from "react";
import { DisplayStateApi, GetDisplayQueueDto, GetDisplayStateDto, TextUnitQueuesApi } from "../../api/generated";
import { useApi } from "../../services/useApi";

export const DisplayQueuesController: React.FC<{
    displayState: GetDisplayStateDto,
}> = ({ displayState }) => {

    const [displayQueue, setDisplayQueue] =
        useState<GetDisplayQueueDto>();
    const { getApi } = useApi();

    useEffect(() => {
        loadState();
    }, [displayState]);

    const loadState = () => {
        fetchQueue(displayState.textUnitQueueId);
    }

    const currentTextUnitQueueIsNotEmpty = () => {
        return displayQueue?.queueTextUnits?.length;
    };

    const setCurrentTextUnitRequest = async (textUnitId: string) => {
        await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
            textUnitId: textUnitId,
            textUnitPart: 0,
            textUnitPartPage: 0,
        });
    };

    const fetchQueue = async (id: string) => {
        const queue = await getApi(TextUnitQueuesApi).displayQueuesControllerFindOne(id.toString());
        setDisplayQueue(queue.data);
    };

    return (
        <Box>
            <Typography variant="h5">{displayQueue?.name}</Typography>
            {!currentTextUnitQueueIsNotEmpty() && (
                <Typography>[Brak tekstów]</Typography>
            )}
            {displayQueue?.queueTextUnits?.map((queueTextUnit, index) => {
                return (
                    <Card
                        key={index}
                        onClick={() => setCurrentTextUnitRequest(queueTextUnit.textUnitId)}
                        sx={{
                            my: 1,
                            p: 1,
                            backgroundColor:
                                displayState?.textUnitId === queueTextUnit.textUnitId
                                    ? "#2e3133"
                                    : "#06090a",
                        }}
                    >
                        <Typography variant="h5">{queueTextUnit.textTitle}</Typography>
                    </Card>
                );
            })}
        </Box>
    )
}