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
    const [displayQueue, setDisplayQueue] = useState<CreateDisplayQueueDto>();

    useEffect(() => {
        setDisplayQueue({
            description: "",
            name: "",
            textUnitIds: [],
        });
    }, [open]);

    const onSave = async () => {
        if (!displayQueue) return;
        await textUnitQueuesApi.displayQueuesControllerCreate(displayQueue);
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
                        setDisplayQueue={setDisplayQueue} />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Anuluj</Button>
                <Button onClick={onSave}>Zapisz</Button>
            </DialogActions>
        </Dialog>
    );
};
