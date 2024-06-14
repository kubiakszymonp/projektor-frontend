import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { CreateDisplayQueueDto, GetDisplayQueueDto, TextUnitQueuesApi } from "../../api/generated";
import { DisplayQueueInputs } from "./display-queue-inputs";
import { useApi } from "../../services/useApi";

export const TextUnitQueueCreateDialog: React.FC<{
    open: boolean;
    handleClose: () => void;
}> = ({ open, handleClose }) => {
    const [displayQueue, setDisplayQueue] = useState<CreateDisplayQueueDto>();
    const { getApi } = useApi();

    useEffect(() => {
        setDisplayQueue({
            description: "",
            name: "",
            textUnitIds: [],
        });
    }, [open]);

    const onSave = async () => {
        if (!displayQueue) return;
        await getApi(TextUnitQueuesApi).displayQueuesControllerCreate(displayQueue);
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
