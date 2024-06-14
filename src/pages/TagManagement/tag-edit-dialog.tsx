import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { DisplayQueueInputs } from "../TextUnitQueues/display-queue-inputs";
import { useEffect, useState } from "react";
import { CreateDisplayQueueDto, CreateTextUnitTagDto, TextUnitTagApi } from "../../api/generated";
import { textUnitTagApi } from "../../api";
import { TagInputs } from "./tag-inputs";

export const TagEditDialog: React.FC<{
    open: boolean;
    handleClose: () => void;
    tagId: string;
}> = ({ open, handleClose, tagId }) => {

    const [tag, setTag] = useState<CreateTextUnitTagDto>();

    useEffect(() => { fetchTag(); }, [open]);

    const fetchTag = async () => {
        const res = await textUnitTagApi.textUnitTagControllerFindOne(tagId);
        setTag({
            name: res.data.name,
            description: res.data.description,
        });
    }

    const onSave = async () => {
        await textUnitTagApi.textUnitTagControllerUpdate(tagId, {
            ...tag,
            id: tagId,
        });

        handleClose();
    }

    const handleDelete = async () => {
        await textUnitTagApi.textUnitTagControllerRemove(tagId);
        handleClose();
    }

    return (

        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>
                Edytuj tag
            </DialogTitle>
            <DialogContent>
                {
                    tag && (<TagInputs tag={tag} setTag={setTag} />)
                }
            </DialogContent>
            <DialogActions>
                <Button
                    color="error"
                    onClick={handleDelete}
                >
                    Usuń
                </Button>
                <Button onClick={handleClose}>Anuluj</Button>
                <Button onClick={onSave}>Zapisz</Button>
            </DialogActions>
        </Dialog>
    );
}