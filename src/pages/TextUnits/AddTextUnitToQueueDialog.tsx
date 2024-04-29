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
import { textUnitQueuesApi } from "../../api";
import { TextUnitDto, TextUnitQueueDto } from "../../api/generated";

export const AddTextUnitToQueueDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
  textUnitId: number;
}> = ({
  open,
  handleClose,
  textUnitId
}) => {
    const [searchPlaylistText, setSearchPlaylistText] = useState<string>("");
    const [modifiedPlaylists, setModifiedPlaylists] = useState<
      TextUnitQueueDto[]
    >([]);

    useEffect(() => {
      setSearchPlaylistText("");
      setModifiedPlaylists([]);
    }, [open]);

    const onSave = async () => {
      const promises = modifiedPlaylists.map((playlist) => {
        return textUnitQueuesApi.textUnitQueuesControllerUpdate(playlist);
      });

      await Promise.all(promises);
      handleSave();
    };

    const textUnitInsideQueue = (textUnitId: number, queue: TextUnitQueueDto) => {
      return queue.content.textUnits.some((textUnit) => textUnit.id === textUnitId);
    };

    const onModifyQueue = (queue: TextUnitQueueDto, value: boolean) => {
      const newQueue = { ...queue };
      if (value) {
        newQueue.content.textUnits.push({
          id: textUnit.id,
          title: textUnit.title,
        });
      } else {
        newQueue.content.textUnits = newQueue.content.textUnits.filter(
          (s) => s.id !== textUnit.id
        );
      }
      setAllQueues(allQueues.map((p) => (p.id === queue.id ? newQueue : p)));

      setModifiedPlaylists(
        modifiedPlaylists.some((p) => p.id === queue.id)
          ? modifiedPlaylists.map((p) => (p.id === queue.id ? newQueue : p))
          : [...modifiedPlaylists, newQueue]
      );
    };

    return (
      <Dialog fullWidth open={open} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
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
                    <Checkbox
                      checked={textUnitInsideQueue(textUnit.id, queue)}
                      onChange={(_e, checked) => onModifyQueue(queue, checked)}
                    />
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
