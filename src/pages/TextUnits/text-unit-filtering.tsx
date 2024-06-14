import { Box, Stack, Chip, TextField, Card, Typography, Button, Checkbox } from "@mui/material";
import { GetTextUnitTagDto } from "../../api/generated";
import Fuse from "fuse.js";
import { useState, useMemo, useEffect } from "react";
import { textUnitTagApi } from "../../api";
import { SelectableProperty } from "./text-unit-queues";

export const TextUnitFiltering: React.FC<{ selectedTags: GetTextUnitTagDto[], setSelectedTags: (selectedTags: GetTextUnitTagDto[]) => void }> = ({
    setSelectedTags, selectedTags
}) => {
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


    useEffect(() => {
        setSearchTextUnitTagsText("");
        fetchTags();
    }, []);

    const fetchTags = async () => {
        const res = await textUnitTagApi.textUnitTagControllerFindAll();
        setAllTags(res.data);
    };

    const isSelected = (tagId: string) => {
        return selectedTags.some(q => q.id === tagId);
    }

    const onCheckTag = (tagId: string, value: boolean) => {

        const selected = isSelected(tagId);

        if (selected) {
            setSelectedTags(selectedTags.filter(q => q.id !== tagId));
        }
        else {
            setSelectedTags([...selectedTags, allTags.find(q => q.id === tagId)!]);
        }
    };

    return (
        <Box sx={{width: "100%"}}>
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
                                <Checkbox
                                    checked={isSelected(tag.id)}
                                    onChange={(_e, checked) => onCheckTag(tag.id, checked)}
                                />
                            </Button>
                        </Stack>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};