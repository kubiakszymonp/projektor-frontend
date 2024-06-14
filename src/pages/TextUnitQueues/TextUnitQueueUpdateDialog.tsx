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


export const TextUnitQueueEditDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
  textUnitQueueId: string;
}> = ({ open, handleClose, textUnitQueueId }) => {
  const [displayQueue, setDisplayQueue] = useState<CreateDisplayQueueDto>();
  const { getApi } = useApi();

  useEffect(() => {
    if (open)
      fetchTextUnitQueue();
  }, [open]);

  const fetchTextUnitQueue = async () => {
    const res = await getApi(TextUnitQueuesApi).displayQueuesControllerFindOne(textUnitQueueId.toString());
    setDisplayQueue({
      name: res.data.name,
      description: res.data.description,
      textUnitIds: res.data.queueTextUnits.map((t) => t.textUnitId),
    });
  };

  const onSave = async () => {
    if (!displayQueue) return;
    await getApi(TextUnitQueuesApi).displayQueuesControllerUpdate({
      ...displayQueue,
      id: textUnitQueueId,
    });

    handleClose();
  };

  const onDelete = async () => {
    if (!displayQueue) return;
    await getApi(TextUnitQueuesApi).displayQueuesControllerRemove(textUnitQueueId.toString());
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
        <Button color="error" disabled={false} onClick={onDelete}>
          Usuń
        </Button>
        <Button onClick={handleClose}>Anuluj</Button>
        <Button onClick={onSave}>Zapisz</Button>
      </DialogActions>
    </Dialog>
  );
};
