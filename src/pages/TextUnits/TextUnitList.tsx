import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { textUnitApi, textUnitQueuesApi, textUnitTagApi } from "../../api";
import { TextUnitEditDialog } from "./TextUnitEditDialog";
import { AddTextUnitToQueueDialog } from "./AddTextUnitToQueueDialog";
import { MoreVert } from "@mui/icons-material";
import {
  TextUnitDto,
  TextUnitQueueDto,
  TextUnitTagDto,
} from "../../api/generated";
import { ManageTagsDialog } from "./ManageTagsDialog";

export const emptyTextUnitObject: TextUnitDto = {
  id: -1,
  title: "",
  content: "",
  tags: [],
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export const TextUnitList: React.FC = () => {
  const [textUnitEditDialogOpen, setTextUnitEditDialogOpen] = useState(false);
  const [textUnitAddToQueueDialogOpen, setTextUnitAddToQueueDialogOpen] =
    useState(false);
  const [manageTagsDialogOpen, setManageTagsDialogOpen] = useState(false);
  const [textUnitList, setTextUnitList] = useState<TextUnitDto[]>([]);
  const [displayTextUnits, setDisplayTextUnits] = useState<TextUnitDto[]>([]);
  const [queues, setQueues] = useState<TextUnitQueueDto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [editTextUnitDialogTitle, setEditTextUnitDialogTitle] =
    useState<string>("");
  const [currentlyOperatedTextUnit, setCurrentlyOperatedTextUnit] =
    useState<TextUnitDto>(emptyTextUnitObject);
  const [tags, setTags] = useState<TextUnitTagDto[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    fetchTextUnitList();
    fetchQueues();
    fetchTags();
  }, []);

  useEffect(() => {
    onChangeFilter();
  }, [searchText, selectedTags, textUnitList]);

  const handleClose = () => {
    setTextUnitEditDialogOpen(false);
    setTextUnitAddToQueueDialogOpen(false);
    setManageTagsDialogOpen(false);
    fetchTextUnitList();
    fetchQueues();
    fetchTags();
  };

  const fetchTags = async () => {
    const res = await textUnitTagApi.textUnitTagControllerFindAll();
    setTags(res.data);
  };

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClickTextUnitMenu = (el: HTMLElement) => {
    setAnchorEl(el);
  };

  const handleCloseTextUnitMenu = () => {
    setAnchorEl(null);
  };

  const handleSave = async (textUnit: TextUnitDto) => {
    if (textUnit.id === -1) {
      await textUnitApi.textUnitControllerCreate(textUnit);
    } else {
      await textUnitApi.textUnitControllerUpdate(textUnit);
    }
    handleClose();
  };

  const onAddTextUnitToPlaylist = () => {
    setCurrentlyOperatedTextUnit(currentlyOperatedTextUnit);
    setTextUnitAddToQueueDialogOpen(true);
  };

  const fetchTextUnitList = async () => {
    const res = await textUnitApi.textUnitControllerFindAll();
    setTextUnitList(res.data);
  };

  const fetchQueues = async () => {
    const res = await textUnitQueuesApi.textUnitQueuesControllerFindAll();
    setQueues(res.data);
  };

  const castTextUnitDirectly = async () => {
    await textUnitApi.textUnitControllerSetCurrentTextUnit({
      id: currentlyOperatedTextUnit.id,
    });
  };

  const onChangeFilter = () => {
    let filtered: TextUnitDto[] = textUnitList;

    if (selectedTags.length > 0) {
      filtered = textUnitList.filter((textUnit) =>
        textUnit.tags.some((tag) => selectedTags.includes(tag.id))
      );
    }

    if (searchText === "") {
      setDisplayTextUnits(filtered);
      return;
    }

    const result = new Fuse(filtered, {
      keys: ["title"],
      includeScore: true,
      shouldSort: true,
      minMatchCharLength: 1,
    }).search(searchText);

    setDisplayTextUnits(result.map((r) => r.item));
  };

  const onAddTextUnit = () => {
    setEditTextUnitDialogTitle("Dodaj tekst");
    setCurrentlyOperatedTextUnit(emptyTextUnitObject);
    setTextUnitEditDialogOpen(true);
  };

  const onEditTextUnit = (textUnitId: number) => {
    setEditTextUnitDialogTitle("Edytuj tekst");
    const foundTextUnit = textUnitList.find((s) => s.id === textUnitId);
    if (foundTextUnit) setCurrentlyOperatedTextUnit(foundTextUnit);
    setTextUnitEditDialogOpen(true);
  };

  const handleChangeTagsSelection = (event: SelectChangeEvent<number>) => {
    const values = event.target.value as unknown as number[];
    setSelectedTags(values);
  };

  const onClickManageTags = () => {
    setManageTagsDialogOpen(true);
  };

  return (
    <>
      <TextUnitEditDialog
        operatedTextUnit={currentlyOperatedTextUnit}
        setOperatedTextUnit={setCurrentlyOperatedTextUnit}
        open={textUnitEditDialogOpen}
        handleClose={handleClose}
        handleSave={handleSave}
        title={editTextUnitDialogTitle}
      />
      <AddTextUnitToQueueDialog
        textUnit={currentlyOperatedTextUnit}
        open={textUnitAddToQueueDialogOpen}
        handleClose={handleClose}
        handleSave={handleClose}
        title={"Dodaj tekst do kolejki"}
        allQueues={queues}
        setAllQueues={setQueues}
      />
      <ManageTagsDialog handleClose={handleClose} open={manageTagsDialogOpen} />
      <Box
        sx={{
          py: {
            xs: 1,
            md: 3,
          },
          px: {
            xs: 1,
            md: 5,
          },
          color: "white",
          bgcolor: "#06090a",
          height: "100%",
          minHeight: "100vh",
        }}
      >
        <Box>
          <Stack direction={"row"}>
            <TextField
              fullWidth
              id="text-unit-conteint"
              label="Wyszukaj tekst"
              variant="outlined"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              variant="outlined"
              sx={{
                width: "8rem",
                px: 5,
                ml: 1,
              }}
              onClick={onAddTextUnit}
            >
              Dodaj
            </Button>
          </Stack>
        </Box>
        <Box>
          <Stack direction={"row"}>
            <FormControl sx={{ my: 1 }} fullWidth>
              <InputLabel id="demo-multiple-checkbox-label">
                Wybrane tagi
              </InputLabel>
              <Select
                labelId="demo-multiple-checkbox-label"
                id="demo-multiple-checkbox"
                multiple
                value={selectedTags as any}
                onChange={handleChangeTagsSelection}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                      width: 250,
                    },
                  },
                }}
                renderValue={(selected) =>
                  `Wybrano (${(selected as any).length})`
                }
                input={<OutlinedInput label="Wybrane tagi" />}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    <Checkbox
                      checked={selectedTags.some(
                        (selectedTag) => selectedTag === tag.id
                      )}
                    />
                    <ListItemText primary={tag.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              sx={{
                width: "8rem",
                px: 5,
                my: 1,
                ml: 1,
              }}
              onClick={onClickManageTags}
            >
              Tagi
            </Button>
          </Stack>
        </Box>
        <Stack
          direction={"column"}
          sx={{
            mt: 3,
            gap: {
              xs: 1,
              md: 3,
            },
          }}
        >
          {displayTextUnits.map((textUnit) => (
            <Card
              sx={{
                borderRadius: 2,
                p: {
                  xs: 1,
                  md: 2,
                },
              }}
              key={textUnit.id}
            >
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography
                  onClick={() => onEditTextUnit(textUnit.id)}
                  variant={"h6"}
                  textOverflow={"ellipsis"}
                  sx={{
                    width: "100%",
                    fontSize: {
                      xs: "0.85rem", // For xs breakpoints and below
                      sm: "1.25rem", // For sm breakpoints and above
                      // Add more breakpoints as needed
                    },
                  }}
                >
                  {textUnit.title}
                </Typography>
                <Stack flexWrap="nowrap" direction="row">
                  {isXs ? (
                    <>
                      <IconButton
                        onClick={(e) => {
                          setCurrentlyOperatedTextUnit(textUnit);
                          handleClickTextUnitMenu(e.currentTarget);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setCurrentlyOperatedTextUnit(textUnit);
                          castTextUnitDirectly();
                        }}
                      >
                        Rzutuj
                      </Button>
                      <Button
                        color="info"
                        onClick={() => {
                          setCurrentlyOperatedTextUnit(textUnit);
                          onAddTextUnitToPlaylist();
                        }}
                      >
                        Playlisty
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Box>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleCloseTextUnitMenu}
      >
        <MenuItem
          onClick={() => {
            castTextUnitDirectly();
            handleCloseTextUnitMenu();
          }}
        >
          Rzutuj
        </MenuItem>
        <MenuItem
          onClick={() => {
            onAddTextUnitToPlaylist();
            handleCloseTextUnitMenu();
          }}
        >
          Playlisty
        </MenuItem>
      </Menu>
    </>
  );
};
