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

export type CurrentTextUnitType =  Omit<TextUnitDto, "id">;

export const emptyTextUnitObject: Omit<TextUnitDto, "id"> = {
  title: "",
  content: "",
  tags: [],
};


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
  textUnitId: number | null;
}> = ({
  open,
  handleClose,
  textUnitId,
}) => {
    const [contentValidation, setContentValidation] = useState<string | null>(
      null
    );
    const [availableTags, setAvailableTags] = useState<TextUnitTagDto[]>([]);
    const [allTags, setAllTags] = useState<TextUnitTagDto[]>([]);
    const [currentTextUnit, setCurrentTextUnit] = useState<CurrentTextUnitType>(emptyTextUnitObject);

    useEffect(() => {
      fetchTags();
      fetchTextUnit();
    }, [open]);

    useEffect(() => {
      filterAvailableTags();
    }, [currentTextUnit.tags, allTags]);

    useEffect(() => {
      const valid = validateSong(currentTextUnit.content);
      setContentValidation(valid);
    }, [currentTextUnit.content]);

    const onClickTag = (tag: TextUnitTagDto) => {
      if (currentTextUnit.tags.some((t) => t.id === tag.id)) {
        setCurrentTextUnit({
          ...currentTextUnit,
          tags: currentTextUnit.tags.filter((t) => t.id !== tag.id),
        });
      } else {
        setCurrentTextUnit({
          ...currentTextUnit,
          tags: [...currentTextUnit.tags, tag],
        });
      }
    };

    const fetchTextUnit = async () => {
      if (textUnitId === null) {
        setCurrentTextUnit(emptyTextUnitObject);
      }
      else {
        const res = await textUnitApi.textUnitControllerFindOne(String(textUnitId));
        setCurrentTextUnit(res.data);
      }
    };

    const handleDelete = async () => {
      await textUnitApi.textUnitControllerRemove(String(currentTextUnit.id));
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

    const filterAvailableTags = () => {
      setAvailableTags(
        allTags.filter(
          (tag) => !currentTextUnit.tags.some((t) => t.id === tag.id)
        )
      );
    };

    return (
      <Dialog fullWidth open={open} onClose={handleClose}>
        <DialogTitle>{currentTextUnit.id === null ? "Dodaj nowy tekst" : "Edytuj tekst"}</DialogTitle>
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
            value={currentTextUnit.title}
            onChange={(e) => {
              setCurrentTextUnit({ ...currentTextUnit, title: e.target.value });
            }}
          />
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              required
              id="outlined-multiline-static"
              label="Zawartość tekstu"
              multiline
              value={currentTextUnit.content}
              onChange={(e) => {
                setCurrentTextUnit({
                  ...currentTextUnit,
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
            {currentTextUnit.tags.map((tag) => (
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
            disabled={currentTextUnit.id === -1}
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
