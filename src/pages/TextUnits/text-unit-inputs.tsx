import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, Stack, Tab, Tabs, TextField } from "@mui/material";
import { CreateTextUnitDto, GetTextUnitTagDto } from "../../api/generated";
import { textUnitTagApi } from "../../api";
import { useEffect, useMemo, useState } from "react";
import { ExpandMore } from "@mui/icons-material";
import { TextUnitQueues } from "./text-unit-queues";
import { TextUnitTags } from "./text-unit-tags";
import { TextUnitPreview } from "./text-unit-preview";


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}


export const TextUnitInputs: React.FC<{ textUnit: CreateTextUnitDto, setTextUnit: (textUnit: CreateTextUnitDto) => void }> = ({
    textUnit,
    setTextUnit
}) => {
    const [openedTabIdx, setOpenedTabIdx] = useState(0);

    return (
        <>
            <Tabs value={openedTabIdx} onChange={(_e, newValue) => {
                setOpenedTabIdx(newValue);
            }}
                aria-label="basic tabs example">
                <Tab label="Edytor" />
                <Tab label="Podgląd" />
            </Tabs>
            <CustomTabPanel value={openedTabIdx} index={0}>
                <Stack>
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
                </Stack>
            </CustomTabPanel >
            <CustomTabPanel value={openedTabIdx} index={1}>
                <TextUnitPreview textUnit={textUnit} />
            </CustomTabPanel>


        </>
    )
} 