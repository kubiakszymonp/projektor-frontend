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
import { textUnitQueuesApi } from "../../api";
import { DragAndDropItem } from "./TextUnitQueueList";
import { TextUnitQueueDragAndDrop } from "./TextUnitQueueDragAndDropComponent";
import { GetDisplayQueueDto, UpdateDisplayQueueDto, UpdateTextUnitDto } from "../../api/generated";


export const TextUnitQueueEditDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
  textUnitQueueId: number;
}> = ({ open, handleClose, textUnitQueueId }) => {
  const [queueTextUnits, setQueueTextUnits] = useState<DragAndDropItem[]>([]);
  const [displayQueue, setDisplayQueue] = useState<GetDisplayQueueDto>();

  useEffect(() => {
    fetchTextUnitQueue();
  }, [open]);

  useEffect(() => {
    if (!displayQueue) return;
    setQueueTextUnits(
      displayQueue.queueTextUnits.map((textUnit) => ({
        key: String(textUnit.id),
        text: textUnit.textTitle,
      }))
    );
  }, [displayQueue]);


  const fetchTextUnitQueue = async () => {
    const res = await textUnitQueuesApi.displayQueuesControllerFindOne(textUnitQueueId.toString());
    setDisplayQueue(res.data);
  };


  const onSave = async () => {
    if (!displayQueue) return;
    await textUnitQueuesApi.displayQueuesControllerUpdate({
      id: displayQueue.id,
      name: displayQueue.name,
      description: displayQueue.description,
      textUnitIds: displayQueue.queueTextUnits.map((textUnit) => textUnit.id),
    });

    handleClose();
  };

  const onDeleteItem = (key: string) => {
    setQueueTextUnits(
      queueTextUnits.filter((textUnit) => textUnit.key !== key)
    );
  };

  const onDelete = async () => {
    if (!displayQueue) return;
    await textUnitQueuesApi.displayQueuesControllerRemove(displayQueue.id.toString());
    handleClose();
  };

  return (

    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        Edytuj kolejkę
      </DialogTitle>
      <DialogContent>
        {displayQueue && (
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
