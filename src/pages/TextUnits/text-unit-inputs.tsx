import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, Stack, TextField } from "@mui/material";
import { CreateTextUnitDto, GetTextUnitTagDto } from "../../api/generated";
import { textUnitTagApi } from "../../api";
import { useEffect, useMemo, useState } from "react";
import { ExpandMore } from "@mui/icons-material";
import { TextUnitQueues } from "./text-unit-queues";
import { TextUnitTags } from "./text-unit-tags";

export const TextUnitInputs: React.FC<{ textUnit: CreateTextUnitDto, setTextUnit: (textUnit: CreateTextUnitDto) => void }> = ({
    textUnit,
    setTextUnit
}) => {

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
                    <TextUnitTags setTextUnit={setTextUnit} textUnit={textUnit} />
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