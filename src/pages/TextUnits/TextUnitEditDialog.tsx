import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CustomPopover } from "../../components/popover";
import { CreateTextUnitDto, TextUnitsApi } from "../../api/generated";
import { TextUnitInputs } from "./text-unit-inputs";
import { useApi } from "../../services/useApi";



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
  const { getApi } = useApi();

  useEffect(() => {
    loadTextUnit();
  }, [open]);

  const loadTextUnit = async () => {
    const res = await getApi(TextUnitsApi).textUnitControllerFindOne(String(textUnitId));
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
    await getApi(TextUnitsApi).textUnitControllerRemove(String(textUnitId));
    handleClose();
  };


  const onSave = async () => {
    if (!textUnit) return;
    await getApi(TextUnitsApi).textUnitControllerUpdate({ ...textUnit, id: textUnitId });
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
