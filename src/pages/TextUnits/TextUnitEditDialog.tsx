import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  DialogActions,
  Button,
} from "@mui/material";
import { textUnitApi } from "../../api";
import { Song } from "song-parser";
import { useEffect, useState } from "react";
import { TransitionAlert } from "../../components/alert.component";
import { TextUnitDto } from "../../api/generated";
import { CustomPopover } from "../../components/popover";

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
  handleSave: (textUnit: TextUnitDto) => void;
  title: string;
  operatedTextUnit: TextUnitDto;
  setOperatedTextUnit: (textUnit: TextUnitDto) => void;
}> = ({
  open,
  handleClose,
  handleSave,
  title,
  operatedTextUnit,
  setOperatedTextUnit,
}) => {
  const [contentValidation, setContentValidation] = useState<string | null>(
    null
  );
  const onSave = () => {
    handleSave(operatedTextUnit);
  };

  const handleDelete = async () => {
    await textUnitApi.textUnitControllerRemove(String(operatedTextUnit.id));
    handleClose();
  };

  const validateSong = (songContent: string) => {
    try {
      new Song(songContent);
    } catch (er) {
      return (er as Error).message;
    }
    return null;
  };

  useEffect(() => {
    const valid = validateSong(operatedTextUnit.content);
    setContentValidation(valid);
  }, [operatedTextUnit.content]);

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          required
          id="title"
          name="title"
          label="Tytuł tekstu"
          type="text"
          fullWidth
          variant="standard"
          value={operatedTextUnit.title}
          onChange={(e) => {
            setOperatedTextUnit({ ...operatedTextUnit, title: e.target.value });
          }}
        />
        <Box sx={{ pt: 5 }}>
          <TextField
            fullWidth
            required
            id="outlined-multiline-static"
            label="Zawartość tekstu"
            multiline
            value={operatedTextUnit.content}
            onChange={(e) => {
              setOperatedTextUnit({
                ...operatedTextUnit,
                content: e.target.value,
              });
            }}
          />
        </Box>
        <TransitionAlert
          opened={contentValidation !== null}
          text={contentValidation || ""}
          severity={"error"}
        />
      </DialogContent>
      <DialogActions>
        <CustomPopover text={SONG_HELP_TEXT} />
        <Button
          color="error"
          disabled={operatedTextUnit.id === -1}
          onClick={handleDelete}
        >
          Usuń
        </Button>
        <Button onClick={handleClose}>Anuluj</Button>
        <Button
          color="success"
          onClick={onSave}
          disabled={contentValidation !== null}
        >
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};
