import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { DisplayQueueInputs } from "../TextUnitQueues/display-queue-inputs";
import { useEffect, useState } from "react";
import { CreateTextUnitTagDto, TextUnitTagApi } from "../../api/generated";
import { TagInputs } from "./tag-inputs";
import { useApi } from "../../services/useApi";

export const TagCreateDialog: React.FC<{
    open: boolean;
    handleClose: () => void;
}> = ({ open, handleClose }) => {

    const [tag, setTag] = useState<CreateTextUnitTagDto>({
        name: "",
        description: "",
    });
    const { getApi } = useApi();

    useEffect(() => {
        setTag({
            name: "",
            description: "",
        });
    }, [open]);

    const onSave = async () => {
        await getApi(TextUnitTagApi).textUnitTagControllerCreate(tag);
        handleClose();
    }
    return (
        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>
                Dodaj tag
            </DialogTitle>
            <DialogContent>
                <TagInputs tag={tag} setTag={setTag} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Anuluj</Button>
                <Button onClick={onSave}>Zapisz</Button>
            </DialogActions>
        </Dialog>
    );
}