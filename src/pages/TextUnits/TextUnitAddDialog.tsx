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
import { CreateTextUnitDto, GetTextUnitTagDto } from "../../api/generated";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;


export const emptyTextUnitObject: CreateTextUnitDto = {
    content: "",
    displayQueueIds: [],
    textUnitTagIds: [],
    title: "",
    partsOrder: "",
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

export const TextUnitAddDialog: React.FC<{
    open: boolean;
    handleClose: () => void;
}> = ({ open, handleClose }) => {

    const [availableTags, setAvailableTags] = useState<GetTextUnitTagDto[]>([]);
    const [allTags, setAllTags] = useState<GetTextUnitTagDto[]>([]);
    const [textUnit, setTextUnit] =
        useState<CreateTextUnitDto>(emptyTextUnitObject);

    useEffect(() => {
        fetchTags();
        setTextUnit(emptyTextUnitObject);
    }, [open]);

    useEffect(() => {
        filterAvailableTags();
    }, [textUnit.textUnitTagIds, allTags]);

    const onClickTag = (tag: GetTextUnitTagDto) => {

        const isTagAlreadyAdded = textUnit.textUnitTagIds.some((t) => t === tag.id);
        if (isTagAlreadyAdded) {
            setTextUnit({
                ...textUnit,
                textUnitTagIds: textUnit.textUnitTagIds.filter((t) => t !== tag.id),
            });
        }
        else {
            setTextUnit({
                ...textUnit,
                textUnitTagIds: [...textUnit.textUnitTagIds, tag.id],
            });
        }
    };

    const fetchTags = async () => {
        const res = await textUnitTagApi.textUnitTagControllerFindAll();
        setAllTags(res.data);
    };

    const filterAvailableTags = () => {
        setAvailableTags(allTags.filter((tag) => !textUnit.textUnitTagIds.includes(tag.id)));
    };

    const onSave = async () => {
        await textUnitApi.textUnitControllerCreate(textUnit);
        handleClose();
    };

    return (
        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>
                Dodaj nowy tekst
            </DialogTitle>
            <DialogContent>
                <TextField
                    required
                    id="title"
                    name="title"
                    label="Tytuł tekstu"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={textUnit.title}
                    onChange={(e) => {
                        setTextUnit({ ...textUnit, title: e.target.value });
                    }}
                />
                <Box sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        required
                        id="outlined-multiline-static"
                        label="Zawartość tekstu"
                        multiline
                        value={textUnit.content}
                        onChange={(e) => {
                            setTextUnit({
                                ...textUnit,
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
                    {textUnit.textUnitTagIds.map((tagId) => {
                        const tag = allTags.find((t) => t.id === tagId);

                        return (tag &&
                            <Chip
                                key={tagId}
                                label={tag.name}
                                variant="outlined"
                                onDelete={() => {
                                    onClickTag(tag);
                                }}
                            />
                        )
                    })}
                </Stack>

            </DialogContent>
            <DialogActions>
                <CustomPopover text={SONG_HELP_TEXT} />
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
