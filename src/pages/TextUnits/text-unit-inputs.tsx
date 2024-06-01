import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, Stack, TextField } from "@mui/material";
import { CreateTextUnitDto, GetTextUnitTagDto } from "../../api/generated";
import { textUnitTagApi } from "../../api";
import { useEffect, useMemo, useState } from "react";
import { ExpandMore } from "@mui/icons-material";
import { TextUnitQueues } from "./text-unit-queues";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export const TextUnitInputs: React.FC<{ textUnit: CreateTextUnitDto, setTextUnit: (textUnit: CreateTextUnitDto) => void }> = ({
    textUnit,
    setTextUnit
}) => {
    const [allTags, setAllTags] = useState<GetTextUnitTagDto[]>([]);

    const availableTags = useMemo(() => {
        return allTags.filter((tag) => !textUnit?.textUnitTagIds?.includes(tag.id));
    }, [allTags, textUnit?.textUnitTagIds]);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        const res = await textUnitTagApi.textUnitTagControllerFindAll();
        setAllTags(res.data);
    };

    const onClickTag = (tag: GetTextUnitTagDto) => {
        if (!textUnit || !textUnit.textUnitTagIds) return;
        const isTagAlreadyAdded = textUnit.textUnitTagIds.some((t) => t === tag.id);
        if (isTagAlreadyAdded) {
            setTextUnit({
                ...textUnit,
                textUnitTagIds: textUnit.textUnitTagIds.filter((t) => t !== tag.id),
            });
        }
        else {
            setTextUnit({
                ...textUnit,
                textUnitTagIds: [...textUnit.textUnitTagIds, tag.id],
            });
        }
    };

    return (
        <>
            <TextField
                required
                id="title"
                name="title"
                label="Tytuł tekstu"
                type="text"
                fullWidth
                variant="standard"
                value={textUnit.title}
                onChange={(e) => {
                    setTextUnit({ ...textUnit, title: e.target.value });
                }}
            />
            <Box sx={{ pt: 2 }}>
                <TextField
                    fullWidth
                    required
                    id="outlined-multiline-static"
                    label="Zawartość tekstu"
                    multiline
                    value={textUnit.content}
                    onChange={(e) => {
                        setTextUnit({
                            ...textUnit,
                            content: e.target.value,
                        });
                    }}
                />
            </Box>
            <Box sx={{ pt: 2 }}>
                <TextField
                    fullWidth
                    id="outlined-multiline-static"
                    label="Kolejność wyświetalnia"
                    value={textUnit.partsOrder}
                    onChange={(e) => {
                        setTextUnit({
                            ...textUnit,
                            partsOrder: e.target.value,
                        });
                    }}
                />
            </Box>

            <Accordion disableGutters sx={{ my: 2 }}>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                >
                    Tagi
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl sx={{ mt: 4, mb: 2 }} fullWidth>
                        <InputLabel id="demo-multiple-checkbox-label">Dodaj tagi</InputLabel>
                        <Select
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            value={""}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                                        width: 250,
                                    },
                                },
                            }}
                            renderValue={() => ""}
                            input={<OutlinedInput label="Wybrane tagi" />}
                        >
                            {availableTags.map((tag) => (
                                <MenuItem
                                    key={tag.id}
                                    value={tag.id}
                                    onClick={() => {
                                        onClickTag(tag);
                                    }}
                                >
                                    <ListItemText primary={tag.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Stack direction="row" flexWrap={"wrap"}>
                        {textUnit.textUnitTagIds?.map((tagId) => {
                            const tag = allTags.find((t) => t.id === tagId);

                            return (tag &&
                                <Chip
                                    key={tagId}
                                    label={tag.name}
                                    variant="outlined"
                                    onDelete={() => {
                                        onClickTag(tag);
                                    }}
                                />
                            )
                        })}
                    </Stack>
                </AccordionDetails>
            </Accordion>
            <Accordion disableGutters sx={{ my: 2 }}>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    Playlisty
                </AccordionSummary>
                <AccordionDetails>
                    <TextUnitQueues setTextUnit={setTextUnit} textUnit={textUnit} />
                </AccordionDetails>
            </Accordion>
        </>
    )
} 