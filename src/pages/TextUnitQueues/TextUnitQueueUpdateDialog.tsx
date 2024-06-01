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


export const TextUnitQueueEditDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
  textUnitQueueId: number;
}> = ({ open, handleClose, textUnitQueueId }) => {
  const [displayQueue, setDisplayQueue] = useState<GetDisplayQueueDto>();
  const [editedDisplayQueue, setEditedDisplayQueue] = useState<CreateDisplayQueueDto>();

  useEffect(() => {
    fetchTextUnitQueue();
  }, [open]);

  const fetchTextUnitQueue = async () => {
    const res = await textUnitQueuesApi.displayQueuesControllerFindOne(textUnitQueueId.toString());
    setDisplayQueue(res.data);
  };

  const onSave = async () => {
    if (!displayQueue) return;
    await textUnitQueuesApi.displayQueuesControllerUpdate({
      ...editedDisplayQueue,
      id: textUnitQueueId,
    });

    handleClose();
  };

  const onDelete = async () => {
    if (!displayQueue) return;
    await textUnitQueuesApi.displayQueuesControllerRemove(textUnitQueueId.toString());
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
        <Button color="error" disabled={false} onClick={onDelete}>
          Usuń
        </Button>
        <Button onClick={handleClose}>Anuluj</Button>
        <Button onClick={onSave}>Zapisz</Button>
      </DialogActions>
    </Dialog>
  );
};
