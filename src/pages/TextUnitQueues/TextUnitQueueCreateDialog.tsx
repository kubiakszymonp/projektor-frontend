import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { textUnitQueuesApi } from "../../api";
import { CreateDisplayQueueDto } from "../../api/generated";

const emptyTextUnitQueueObject: CreateDisplayQueueDto = {
    name: "",
    description: "",
    textUnitIds: [],
}

export const TextUnitQueueCreateDialog: React.FC<{
    open: boolean;
    handleClose: () => void;
}> = ({ open, handleClose }) => {
    const [displayQueue, setDisplayQueue] =
        useState<CreateDisplayQueueDto>(emptyTextUnitQueueObject);

    useEffect(() => {
        setDisplayQueue(emptyTextUnitQueueObject);
    }, [open]);

    const onSave = async () => {
        await textUnitQueuesApi.displayQueuesControllerCreate(displayQueue);
        handleClose();
    };

    return (
        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>
                Utwórz kolejkę
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    id="title"
                    name="title"
                    label="Nazwa kolejki"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={displayQueue?.name}
                    onChange={(e) => {
                        setDisplayQueue({
                            ...displayQueue,
                            name: e.target.value,
                        });
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Anuluj</Button>
                <Button onClick={onSave}>Utwórz</Button>
            </DialogActions>
        </Dialog>
    );
};
