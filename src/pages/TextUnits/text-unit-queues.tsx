import {
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { textUnitQueuesApi } from "../../api";
import { CreateTextUnitDto, GetDisplayQueueDto } from "../../api/generated";
import Fuse from "fuse.js";


export interface SelectableProperty {
    id: string;
    name: string;
}

export const TextUnitQueues: React.FC<{
    textUnit: CreateTextUnitDto;
    setTextUnit: (textUnit: CreateTextUnitDto) => void;
}> = ({ textUnit, setTextUnit }) => {
    const [searchPlaylistText, setSearchPlaylistText] = useState<string>("");
    const [allQueues, setAllQueues] = useState<GetDisplayQueueDto[]>([]);

    const filteredQueues = useMemo(() => {
        if (searchPlaylistText === "") return allQueues;
        const result = new Fuse(allQueues, {
            keys: ["name"],
            includeScore: true,
            shouldSort: true,
            minMatchCharLength: 1,
        })
            .search(searchPlaylistText)
            .map((result) => result.item);

        return result;
    }, [allQueues, searchPlaylistText]);

    useEffect(() => {
        setSearchPlaylistText("");
        fetchQueues();
    }, []);

    const selectedQueues: SelectableProperty[] = useMemo(() => {
        return textUnit.displayQueueIds.map((id) => {
            const queue = allQueues.find((q) => q.id === id);
            return queue ? { id: queue.id, name: queue.name } : null;
        }).filter((q) => q !== null) as SelectableProperty[];
    }, [allQueues, textUnit]);

    const fetchQueues = async () => {
        const res = await textUnitQueuesApi.displayQueuesControllerFindAll();
        setAllQueues(res.data);
    };

    const queueContainsTextUnit = (queue: GetDisplayQueueDto) => {
        return textUnit.displayQueueIds.some((q) => q === queue.id);
    };

    const onModifyQueue = (queueId: string, value: boolean) => {
        if (!textUnit) return;

        let selectedQueues = textUnit.displayQueueIds;

        if (value === true) {
            selectedQueues.push(queueId);
        }
        else {
            selectedQueues = selectedQueues.filter(q => q !== queueId);
        }

        setTextUnit({
            ...textUnit,
            displayQueueIds: selectedQueues
        });
    };

    return (
        <Box>
            <Stack direction="row" flexWrap={"wrap"} sx={{ py: 1 }} spacing={1}>
                {selectedQueues.map((queue) => (
                    <Chip
                        key={queue.id}
                        label={queue.name}
                        variant="outlined"
                        onDelete={() => {
                            onModifyQueue(queue.id, false);
                        }}
                        style={{
                            marginBottom: "0.5rem"
                        }}
                    />

                ))}
            </Stack>
            <TextField
                fullWidth
                id="outlined-multiline-static"
                label="Wyszukaj kolejkę"
                value={searchPlaylistText}
                onChange={(e) => {
                    setSearchPlaylistText(e.target.value);
                }}
            />
            <Box sx={{
                my: 2,
                height: 400,
                overflowY: "auto",
            }}>
                {filteredQueues.map((queue) => (
                    <Card sx={{ borderRadius: 2, p: 1, my: 1 }} key={queue.id}>
                        <Stack
                            direction={"row"}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                        >
                            <Typography
                                variant={"h6"}
                                textOverflow={"ellipsis"}
                                noWrap
                                sx={{
                                    fontSize: {
                                        xs: "0.85rem", // For xs breakpoints and below
                                        sm: "1.25rem", // For sm breakpoints and above
                                    },
                                }}
                            >
                                {queue.name}
                            </Typography>
                            <Button color="info">
                                {textUnit && (
                                    <Checkbox
                                        checked={queueContainsTextUnit(queue)}
                                        onChange={(_e, checked) => onModifyQueue(queue.id, checked)}
                                    />
                                )}
                            </Button>
                        </Stack>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};
