import {
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { textUnitApi, textUnitQueuesApi } from "../../api";
import { GetDisplayQueueDto, GetTextUnitDto } from "../../api/generated";

export const AddTextUnitToQueueDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
  textUnitId: number;
}> = ({ open, handleClose, textUnitId }) => {
  const [searchPlaylistText, setSearchPlaylistText] = useState<string>("");
  const [textUnit, setTextUnit] = useState<GetTextUnitDto>();
  const [allQueues, setAllQueues] = useState<GetDisplayQueueDto[]>([]);

  useEffect(() => {
    setSearchPlaylistText("");
    fetchQueues();
    fetchTextUnit();
  }, [open]);

  const onSave = async () => {

    await textUnitApi.textUnitControllerUpdate({
      id: textUnitId,
      displayQueueIds: textUnit?.queues.map((q) => q.id) ?? [],
    });

    handleClose();
  };

  const fetchQueues = async () => {
    const res = await textUnitQueuesApi.displayQueuesControllerFindAll();
    setAllQueues(res.data);
  };

  const fetchTextUnit = async () => {
    const res = await textUnitApi.textUnitControllerFindOne(String(textUnitId));
    setTextUnit(res.data);
  };

  const textUnitInsideQueue = (textUnit: GetTextUnitDto, queue: GetDisplayQueueDto) => {
    return textUnit.queues.some((q) => q.id === queue.id);
  };

  const onModifyQueue = (queue: GetDisplayQueueDto, value: boolean) => {

    if (!textUnit) return;
    let queues = textUnit.queues;

    if (value === true) {
      queues.push({
        id: queue.id,
        position: 0,
        queueName: "",
        textTitle: ""
      });
    }
    else {
      queues = queues.filter((q) => q.id !== queue.id);
    }

    setTextUnit({
      ...textUnit,
      queues: queues
    });
  };

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>Dodaj tekst do kolejki</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 3 }}>
          <TextField
            fullWidth
            required
            id="outlined-multiline-static"
            label="Wyszukaj kolejkę"
            value={searchPlaylistText}
            onChange={(e) => {
              setSearchPlaylistText(e.target.value);
            }}
          />
          {allQueues.map((queue) => (
            <Card sx={{ borderRadius: 2, p: 2, my: 2 }} key={queue.id}>
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography
                  variant={"h6"}
                  textOverflow={"ellipsis"}
                  noWrap
                  sx={{
                    fontSize: {
                      xs: "0.85rem", // For xs breakpoints and below
                      sm: "1.25rem", // For sm breakpoints and above
                    },
                  }}
                >
                  {queue.name}
                </Typography>
                <Button color="info">
                  {textUnit && (
                    <Checkbox
                      checked={textUnitInsideQueue(textUnit, queue)}
                      onChange={(_e, checked) => onModifyQueue(queue, checked)}
                    />
                  )}
                </Button>
              </Stack>
            </Card>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Anuluj</Button>
        <Button onClick={onSave}>Zapisz</Button>
      </DialogActions>
    </Dialog>
  );
};
