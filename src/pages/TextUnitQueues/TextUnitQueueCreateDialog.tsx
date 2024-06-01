import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { textUnitQueuesApi } from "../../api";
import { CreateDisplayQueueDto, GetDisplayQueueDto } from "../../api/generated";
import { DisplayQueueInputs } from "./display-queue-inputs";

export const TextUnitQueueCreateDialog: React.FC<{
    open: boolean;
    handleClose: () => void;
}> = ({ open, handleClose }) => {
    const [displayQueue, setDisplayQueue] = useState<GetDisplayQueueDto>();
    const [editedDisplayQueue, setEditedDisplayQueue] = useState<CreateDisplayQueueDto>();

    useEffect(() => {
        setDisplayQueue({
            description: "",
            name: "",
            queueTextUnits: [],
            id: 0,
        });
    }, [open]);

    const onSave = async () => {
        if (!editedDisplayQueue) return;
        await textUnitQueuesApi.displayQueuesControllerCreate(editedDisplayQueue);
        handleClose();
    };

    return (

        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>
                Edytuj kolejkę
            </DialogTitle>
            <DialogContent>
                {displayQueue && (
                    <DisplayQueueInputs
                        displayQueue={displayQueue}
                        editedDisplayQueue={editedDisplayQueue!}
                        setEditedDisplayQueue={setEditedDisplayQueue} />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Anuluj</Button>
                <Button onClick={onSave}>Zapisz</Button>
            </DialogActions>
        </Dialog>
    );
};
