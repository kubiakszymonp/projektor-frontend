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
import { CreateDisplayQueueDto, CreateTextUnitDto, GetDisplayQueueDto, GetTextUnitDto } from "../../api/generated";
import Fuse from "fuse.js";
import { useApi } from "../../services/useApi";


export interface SelectableProperty {
    id: number;
    name: string;
}

export const TextUnitSelection: React.FC<{
    displayQueue: CreateDisplayQueueDto;
    setDisplayQueue: (displayQueue: CreateDisplayQueueDto) => void;
    allTextUnits: GetTextUnitDto[];
}> = ({ displayQueue, setDisplayQueue, allTextUnits }) => {
    const [searchTextUnitText, setSearchTextUnitText] = useState<string>("");
    const { getApi } = useApi();

    const filteredTextUnits = useMemo(() => {
        if (searchTextUnitText === "") return allTextUnits;
        const result = new Fuse(allTextUnits, {
            keys: ["title"],
            includeScore: true,
            shouldSort: true,
            minMatchCharLength: 1,
        })
            .search(searchTextUnitText)
            .map((result) => result.item);

        return result;
    }, [allTextUnits, searchTextUnitText]);

    useEffect(() => {
        setSearchTextUnitText("");
    }, []);

    const queueContainsTextUnit = (textUnit: GetTextUnitDto) => {
        return displayQueue.textUnitIds.some((q) => q === textUnit.id);
    };

    const onCheckTextUnit = (textUnitId: string, value: boolean) => {
        if (!displayQueue) return;

        let selectedTextUnits = displayQueue.textUnitIds;

        if (value === true) {
            selectedTextUnits.push(textUnitId);
        }
        else {
            selectedTextUnits = selectedTextUnits.filter(q => q !== textUnitId);
        }

        setDisplayQueue({
            ...displayQueue,
            textUnitIds: selectedTextUnits
        });
    }

    return (
        <Box>
            <TextField
                fullWidth
                id="outlined-multiline-static"
                label="Wyszukaj tekst"
                value={searchTextUnitText}
                onChange={(e) => {
                    setSearchTextUnitText(e.target.value);
                }}
            />
            <Box sx={{
                my: 2,
                height: 400,
                overflowY: "auto",
            }}>
                {filteredTextUnits.map((textUnit) => (
                    <Card sx={{ borderRadius: 2, p: 1, my: 1 }} key={textUnit.id}>
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
                                {textUnit.title}
                            </Typography>
                            <Button color="info">
                                {textUnit && (
                                    <Checkbox
                                        checked={queueContainsTextUnit(textUnit)}
                                        onChange={(_e, checked) => onCheckTextUnit(textUnit.id, checked)}
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
