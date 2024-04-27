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
import { Song } from "song-parser";
import { useEffect, useState } from "react";
import { TransitionAlert } from "../../components/alert.component";
import { TextUnitDto, TextUnitTagDto } from "../../api/generated";
import { CustomPopover } from "../../components/popover";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

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
  const [availableTags, setAvailableTags] = useState<TextUnitTagDto[]>([]);
  const [allTags, setAllTags] = useState<TextUnitTagDto[]>([]);

  useEffect(() => {
    fetchTags();
  }, [open]);

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

  const fetchTags = async () => {
    const res = await textUnitTagApi.textUnitTagControllerFindAll();
    setAllTags(res.data);
  };

  useEffect(() => {
    filterAvailableTags();
  }, [operatedTextUnit.tags, allTags]);

  const filterAvailableTags = () => {
    setAvailableTags(
      allTags.filter(
        (tag) => !operatedTextUnit.tags.some((t) => t.id === tag.id)
      )
    );
  };

  useEffect(() => {
    const valid = validateSong(operatedTextUnit.content);
    setContentValidation(valid);
  }, [operatedTextUnit.content]);

  const onClickTag = (tag: TextUnitTagDto) => {
    if (operatedTextUnit.tags.some((t) => t.id === tag.id)) {
      setOperatedTextUnit({
        ...operatedTextUnit,
        tags: operatedTextUnit.tags.filter((t) => t.id !== tag.id),
      });
    } else {
      setOperatedTextUnit({
        ...operatedTextUnit,
        tags: [...operatedTextUnit.tags, tag],
      });
    }
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
          label="Tytuł tekstu"
          type="text"
          fullWidth
          variant="standard"
          value={operatedTextUnit.title}
          onChange={(e) => {
            setOperatedTextUnit({ ...operatedTextUnit, title: e.target.value });
          }}
        />
        <Box sx={{ pt: 2 }}>
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
        <FormControl sx={{ mt: 4, mb: 2 }} fullWidth>
          <InputLabel id="demo-multiple-checkbox-label">Dodaj tagi</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            value={""}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                  width: 250,
                },
              },
            }}
            renderValue={() => ""}
            input={<OutlinedInput label="Wybrane tagi" />}
          >
            {availableTags.map((tag) => (
              <MenuItem
                key={tag.id}
                value={tag.id}
                onClick={() => {
                  onClickTag(tag);
                }}
              >
                <ListItemText primary={tag.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" flexWrap={"wrap"}>
          {operatedTextUnit.tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              variant="outlined"
              onDelete={() => {
                onClickTag(tag);
              }}
            />
          ))}
        </Stack>
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
