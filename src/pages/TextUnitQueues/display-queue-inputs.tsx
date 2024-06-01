import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Box,
    DialogActions,
    Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { DragAndDropItem } from "./TextUnitQueueList";
import { TextUnitQueueDragAndDrop } from "./TextUnitQueueDragAndDropComponent";
import { CreateDisplayQueueDto, GetDisplayQueueDto, GetQueueTextUnit, GetTextUnitDto, UpdateDisplayQueueDto, UpdateTextUnitDto } from "../../api/generated";


export const DisplayQueueInputs: React.FC<{
    displayQueue: GetDisplayQueueDto;
    editedDisplayQueue: CreateDisplayQueueDto;
    setEditedDisplayQueue: (editedDisplayQueue: CreateDisplayQueueDto) => void;
}> = ({ displayQueue, setEditedDisplayQueue, editedDisplayQueue }) => {

    const [queueTextUnits, setQueueTextUnits] = useState<DragAndDropItem[]>([]);

    useEffect(() => {
        setEditedDisplayQueue({
            name: displayQueue.name,
            description: displayQueue.description,
            textUnitIds: displayQueue.queueTextUnits.map((textUnit) => textUnit.textUnitId),
        });

        setQueueTextUnits(displayQueue.queueTextUnits.map(queueTextUit => {
            return {
                key: String(queueTextUit.textUnitId),
                text: queueTextUit.textTitle,
            }
        }));

    }, [displayQueue]);

    useEffect(() => {
        debugger
        if (!editedDisplayQueue) return;
        setEditedDisplayQueue({
            ...editedDisplayQueue,
            textUnitIds: queueTextUnits.map((textUnit) => Number(textUnit.key)),
        });
    }, [queueTextUnits]);

    const onDeleteItem = (key: string) => {
        setQueueTextUnits(
            queueTextUnits.filter((textUnit) => textUnit.key !== key)
        );
    };

    return (
        <>
            {editedDisplayQueue && (
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
                            setEditedDisplayQueue({
                                ...editedDisplayQueue,
                                name: e.target.value,
                            });
                        }}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            pt: 3,
                        }}
                    >
                        {queueTextUnits.length > 0 && (
                            <TextUnitQueueDragAndDrop
                                textUnitsInQueue={queueTextUnits}
                                setTextUnitsInQueue={setQueueTextUnits}
                                onDeleteItem={onDeleteItem}
                            />
                        )}
                    </Box>
                </>
            )}
        </>
    );
};
