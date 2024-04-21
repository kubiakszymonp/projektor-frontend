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

export const TextUnitQueueEditDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
  handleSave: () => void;
  title: string;
  operatedTextUnitQueue: TextUnitQueueDto;
  setOperatedTextUnitQueue: (textUnitQueue: TextUnitQueueDto) => void;
}> = ({
  open,
  handleClose,
  handleSave,
  title,
  operatedTextUnitQueue,
  setOperatedTextUnitQueue,
}) => {
  const [queueTextUnits, setQueueTextUnits] = useState<DragAndDropItem[]>([]);

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

    handleSave();
  };

  const onDeleteItem = (key: string) => {
    setQueueTextUnits(queueTextUnits.filter((textUnit) => textUnit.key !== key));
  };

  const onDelete = async () => {
    await textUnitQueuesApi.textUnitQueuesControllerRemove(
      String(operatedTextUnitQueue.id)
    );
    handleSave();
  };

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
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
