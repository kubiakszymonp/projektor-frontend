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
import { TextUnitQueueDto } from "../../api/generated";
import { DragAndDropItem } from "./TextUnitQueueList";
import { TextUnitQueueDragAndDrop } from "./TextUnitQueueDragAndDropComponent";

const emptyTextUnitQueueObject: TextUnitQueueDto = {
  id: -1,
  name: "",
  content: {
    textUnits: [],
  },
  description: "",
};

export const TextUnitQueueEditDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
  textUnitQueueId: number | null;
}> = ({ open, handleClose, textUnitQueueId }) => {
  const [queueTextUnits, setQueueTextUnits] = useState<DragAndDropItem[]>([]);
  const [operatedTextUnitQueue, setOperatedTextUnitQueue] =
    useState<TextUnitQueueDto>(emptyTextUnitQueueObject);

  useEffect(() => {
    fetchTextUnitQueue();
  }, [open]);

  const fetchTextUnitQueue = async () => {
    if (textUnitQueueId === null) {
      setOperatedTextUnitQueue(emptyTextUnitQueueObject);
    } else {
      const res = await textUnitQueuesApi.textUnitQueuesControllerFindOne(
        String(textUnitQueueId)
      );
      setOperatedTextUnitQueue(res.data);
    }
  };

  useEffect(() => {
    setQueueTextUnits(
      operatedTextUnitQueue.content.textUnits.map((textUnit) => ({
        key: String(textUnit.id),
        text: textUnit.title,
      }))
    );
  }, [operatedTextUnitQueue]);

  const onSave = async () => {
    if (operatedTextUnitQueue.id === -1) {
      await textUnitQueuesApi.textUnitQueuesControllerCreate(
        operatedTextUnitQueue
      );
    } else {
      await textUnitQueuesApi.textUnitQueuesControllerUpdate({
        ...operatedTextUnitQueue,
        content: {
          textUnits: queueTextUnits.map((textUnit) => ({
            id: Number(textUnit.key),
            title: textUnit.text,
          })),
        },
      });
    }

    handleClose();
  };

  const onDeleteItem = (key: string) => {
    setQueueTextUnits(
      queueTextUnits.filter((textUnit) => textUnit.key !== key)
    );
  };

  const onDelete = async () => {
    await textUnitQueuesApi.textUnitQueuesControllerRemove(
      String(operatedTextUnitQueue.id)
    );
    handleClose();
  };

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        {textUnitQueueId === null ? "Utwórz kolejkę" : "Edytuj kolejkę"}
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
          value={operatedTextUnitQueue?.name}
          onChange={(e) => {
            setOperatedTextUnitQueue({
              ...operatedTextUnitQueue,
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
