import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  DialogActions,
  Button,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { textUnitApi, textUnitTagApi } from "../../api";
import { useEffect, useState } from "react";
import { TransitionAlert } from "../../components/alert.component";
import { CustomPopover } from "../../components/popover";
import { CreateTextUnitDto, GetTextUnitTagDto, UpdateTextUnitDto } from "../../api/generated";
import { TextUnitInputs } from "./text-unit-inputs";



const SONG_HELP_TEXT = `Tekst składa się z części oddzielonych nową linią. Każda z części może rozpoczynać się znacznikiem tytułowym wewnątrz kwadratowych nawiasów.\n
\n
Przykład:\n
[Pierwsza zwrotka]\n
Pan kiedyś stanął nad brzegiem,\n
Szukał ludzi gotowych pójść za nim.\n
...\n
\n
[Refren]\n
O Panie to Ty na mnie spojrzałeś,\n
Twoje usta dziś wyrzekły me imię.\n
...
`;

export const TextUnitEditDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
  textUnitId: string;
}> = ({ open, handleClose, textUnitId }) => {
  const [textUnit, setTextUnit] =
    useState<CreateTextUnitDto>();

  useEffect(() => {
    loadTextUnit();
  }, [open]);

  const loadTextUnit = async () => {
    const res = await textUnitApi.textUnitControllerFindOne(String(textUnitId));
    setTextUnit({
      title: res.data.title,
      content: res.data.content,
      textUnitTagIds: res.data.tags.map((tag) => tag.id),
      description: res.data.description,
      displayQueueIds: res.data.queues.map((queue) => queue.displayQueueId),
      partsOrder: res.data.partsOrder ?? "",
      transposition: res.data.transposition ?? 0,
    });
  };

  const handleDelete = async () => {
    await textUnitApi.textUnitControllerRemove(String(textUnitId));
    handleClose();
  };


  const onSave = async () => {
    if (!textUnit) return;
    await textUnitApi.textUnitControllerUpdate({ ...textUnit, id: textUnitId });
    handleClose();
  };

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        Edytuj tekst
      </DialogTitle>
      <DialogContent sx={{ height: "80vh" }}>
        {textUnit && (
          <TextUnitInputs setTextUnit={setTextUnit} textUnit={textUnit} />
        )}
      </DialogContent>
      <DialogActions>
        <CustomPopover text={SONG_HELP_TEXT} />
        <Button
          color="error"
          onClick={handleDelete}
        >
          Usuń
        </Button>
        <Button onClick={handleClose}>Anuluj</Button>
        <Button
          color="success"
          onClick={onSave}
        >
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};
