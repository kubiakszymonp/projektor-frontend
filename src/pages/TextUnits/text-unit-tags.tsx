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
import { textUnitQueuesApi, textUnitTagApi } from "../../api";
import { CreateTextUnitDto, GetDisplayQueueDto, GetTextUnitTagDto, TextUnitTagApi } from "../../api/generated";
import Fuse from "fuse.js";
import { SelectableProperty } from "./text-unit-queues";

export const TextUnitTags: React.FC<{
    textUnit: CreateTextUnitDto;
    setTextUnit: (textUnit: CreateTextUnitDto) => void;
}> = ({ textUnit, setTextUnit }) => {
    const [searchTextUnitTagsText, setSearchTextUnitTagsText] = useState<string>("");
    const [allTags, setAllTags] = useState<GetTextUnitTagDto[]>([]);

    const filteredTags = useMemo(() => {
        if (searchTextUnitTagsText === "") return allTags;
        const result = new Fuse(allTags, {
            keys: ["name"],
            includeScore: true,
            shouldSort: true,
            minMatchCharLength: 1,
        })
            .search(searchTextUnitTagsText)
            .map((result) => result.item);

        return result;
    }, [allTags, searchTextUnitTagsText]);

    const selectedTags: SelectableProperty[] = useMemo(() => {
        return textUnit.textUnitTagIds.map((id) => {
            const tag = allTags.find((q) => q.id === id);
            return tag ? { id: tag.id, name: tag.name } : null;
        }).filter((q) => q !== null) as SelectableProperty[];
    }, [allTags, textUnit]);

    useEffect(() => {
        setSearchTextUnitTagsText("");
        fetchTags();
    }, []);

    const fetchTags = async () => {
        const res = await textUnitTagApi.textUnitTagControllerFindAll();
        setAllTags(res.data);
    };

    const textUnitHasThisTag = (tag: GetTextUnitTagDto) => {
        return textUnit.textUnitTagIds.includes(tag.id);
    };

    const onCheckTag = (tagId: string, value: boolean) => {
        if (!textUnit) return;

        let selectedTags = textUnit.textUnitTagIds;

        if (value === true) {
            selectedTags.push(tagId);
        }
        else {
            selectedTags = selectedTags.filter(q => q !== tagId);
        }

        setTextUnit({
            ...textUnit,
            textUnitTagIds: selectedTags
        });
    };

    return (
        <Box >
            <Stack direction="row" flexWrap={"wrap"} sx={{ py: 1 }} spacing={1}>
                {selectedTags.map((tag) => (
                    <Chip
                        key={tag.id}
                        label={tag.name}
                        variant="outlined"
                        onDelete={() => {
                            onCheckTag(tag.id, false);
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
                label="Wyszukaj tagi"
                value={searchTextUnitTagsText}
                onChange={(e) => {
                    setSearchTextUnitTagsText(e.target.value);
                }}
            />
            <Box sx={{
                height: 400,
                overflowY: "auto",
                my: 2,
            }}>
                {filteredTags.map((tag) => (
                    <Card sx={{ borderRadius: 2, p: 1, my: 1 }} key={tag.id}>
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
                                {tag.name}
                            </Typography>
                            <Button color="info">
                                {textUnit && (
                                    <Checkbox
                                        checked={textUnitHasThisTag(tag)}
                                        onChange={(_e, checked) => onCheckTag(tag.id, checked)}
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