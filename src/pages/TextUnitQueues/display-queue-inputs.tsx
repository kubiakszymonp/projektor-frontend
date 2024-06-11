import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Box,
    DialogActions,
    Button,
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { DragAndDropItem } from "./TextUnitQueueList";
import { TextUnitQueueDragAndDrop } from "./TextUnitQueueDragAndDropComponent";
import { CreateDisplayQueueDto, GetDisplayQueueDto, GetQueueTextUnit, GetTextUnitDto, UpdateDisplayQueueDto, UpdateTextUnitDto } from "../../api/generated";
import { ExpandMore } from "@mui/icons-material";
import { TextUnitSelection } from "./text-unit-queue-text-unit-selection";
import { textUnitApi } from "../../api";


export const DisplayQueueInputs: React.FC<{
    displayQueue: CreateDisplayQueueDto;
    setDisplayQueue: (displayQueue: CreateDisplayQueueDto) => void;
}> = ({ displayQueue, setDisplayQueue }) => {

    const [allTextUnits, setAllTextUnits] = useState<GetTextUnitDto[]>([]);

    useEffect(() => {
        fetchTextUnits();
    }, []);

    const fetchTextUnits = async () => {
        const res = await textUnitApi.textUnitControllerFindAll();
        setAllTextUnits(res.data);
    }

    const queueTextUnits = useMemo(() => {

        return displayQueue.textUnitIds.map((textUnitId) => {
            return {
                key: textUnitId.toString(),
                text: allTextUnits.find(t => t.id === textUnitId)?.title || "",
            }
        });
    }, [displayQueue, allTextUnits]);

    const onDeleteItem = (key: string) => {
        setDisplayQueue({
            ...displayQueue,
            textUnitIds: displayQueue.textUnitIds.filter(t => t !== parseInt(key)),
        });
    };

    return (
        <>
            <TextField
                autoFocus
                required
                id="title"
                name="title"
                label="Nazwa kolejki"
                type="text"
                fullWidth
                variant="standard"
                value={displayQueue.name}
                onChange={(e) => {
                    setDisplayQueue({
                        ...displayQueue,
                        name: e.target.value,
                    });
                }}
            />
            <Accordion disableGutters sx={{ my: 2 }} defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                >
                    Ustawienia kolejności playlisty
                </AccordionSummary>
                <AccordionDetails>
                    {queueTextUnits.length > 0 && (
                        <TextUnitQueueDragAndDrop
                            textUnitsInQueue={queueTextUnits}
                            setTextUnitsInQueue={(textUnits: DragAndDropItem[]) => {
                                setDisplayQueue({
                                    ...displayQueue,
                                    textUnitIds: textUnits.map(t => parseInt(t.key)),
                                });
                            }}
                            onDeleteItem={onDeleteItem}
                        />
                    )}
                </AccordionDetails>
            </Accordion>
            <Accordion disableGutters sx={{ my: 2 }} defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                >
                    Dodawanie tekstów
                </AccordionSummary>
                <AccordionDetails>
                    <TextUnitSelection allTextUnits={allTextUnits} displayQueue={displayQueue} setDisplayQueue={setDisplayQueue} />
                </AccordionDetails>
            </Accordion>
        </>
    );
};
