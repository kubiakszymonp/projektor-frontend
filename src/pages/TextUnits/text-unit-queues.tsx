import {
    Box,
    Button,
    Card,
    Checkbox,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { textUnitQueuesApi } from "../../api";
import { CreateTextUnitDto, GetDisplayQueueDto } from "../../api/generated";
import Fuse from "fuse.js";

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

    const fetchQueues = async () => {
        const res = await textUnitQueuesApi.displayQueuesControllerFindAll();
        setAllQueues(res.data);
    };

    const queueContainsTextUnit = (queue: GetDisplayQueueDto) => {
        return textUnit.displayQueueIds.some((q) => q === queue.id);
    };

    const onModifyQueue = (queue: GetDisplayQueueDto, value: boolean) => {
        if (!textUnit) return;

        let selectedQueues = textUnit.displayQueueIds;

        if (value === true) {
            selectedQueues.push(queue.id);
        }
        else {
            selectedQueues = selectedQueues.filter(q => q !== queue.id);
        }

        setTextUnit({
            ...textUnit,
            displayQueueIds: selectedQueues
        });
    };

    return (
        <Box sx={{ pt: 3 }}>
            <TextField
                fullWidth
                required
                id="outlined-multiline-static"
                label="Wyszukaj kolejkę"
                value={searchPlaylistText}
                onChange={(e) => {
                    setSearchPlaylistText(e.target.value);
                }}
            />
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
                                    onChange={(_e, checked) => onModifyQueue(queue, checked)}
                                />
                            )}
                        </Button>
                    </Stack>
                </Card>
            ))}
        </Box>
    );
};
