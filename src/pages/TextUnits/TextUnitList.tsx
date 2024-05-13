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
import { TextUnitDto, TextUnitTagDto } from "../../api/generated";
import { ManageTagsDialog } from "./ManageTagsDialog";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export const TextUnitList: React.FC = () => {
  const [textUnitEditDialogOpen, setTextUnitEditDialogOpen] = useState(false);
  const [textUnitAddToQueueDialogOpen, setTextUnitAddToQueueDialogOpen] =
    useState(false);
  const [manageTagsDialogOpen, setManageTagsDialogOpen] = useState(false);
  const [textUnitList, setTextUnitList] = useState<TextUnitDto[]>([]);
  const [displayTextUnits, setDisplayTextUnits] = useState<TextUnitDto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [tags, setTags] = useState<TextUnitTagDto[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedTextUnit, setSelectedTextUnit] = useState<TextUnitDto | null>(
    null
  );

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    handleClose();
    refreshData();
  }, []);

  useEffect(() => {
    onChangeFilter();
  }, [searchText, selectedTags, textUnitList]);

  const handleClose = () => {
    closeAllModals();
    refreshData();
  };

  const refreshData = () => {
    fetchTextUnitList();
    fetchTags();
  };

  const closeAllModals = () => {
    setTextUnitEditDialogOpen(false);
    setTextUnitAddToQueueDialogOpen(false);
    setManageTagsDialogOpen(false);
  };

  const fetchTags = async () => {
    const res = await textUnitTagApi.textUnitTagControllerFindAll();
    setTags(res.data);
  };

  const handleClickTextUnitMenu = (el: HTMLElement) => {
    setAnchorEl(el);
  };

  const handleCloseTextUnitMenu = () => {
    setAnchorEl(null);
  };

  const fetchTextUnitList = async () => {
    const res = await textUnitApi.textUnitControllerFindAll();
    setTextUnitList(res.data);
  };

  const setTextUnitForDisplay = async (textUnit: TextUnitDto | null) => {
    if (!textUnit) return;
    await textUnitApi.textUnitControllerSetCurrentTextUnit({
      id: textUnit.id,
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
    setSelectedTextUnit(null);
    setTextUnitEditDialogOpen(true);
  };

  const onEditTextUnit = (textUnit: TextUnitDto) => {
    setSelectedTextUnit(textUnit);
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
        open={textUnitEditDialogOpen}
        handleClose={handleClose}
        textUnitId={selectedTextUnit?.id || null}
      />
      {selectedTextUnit && (
        <AddTextUnitToQueueDialog
          handleClose={handleClose}
          textUnitId={selectedTextUnit.id}
          open={textUnitAddToQueueDialogOpen}
        />
      )}
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
                  onClick={() => onEditTextUnit(textUnit)}
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
                          setSelectedTextUnit(textUnit);
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
                          setTextUnitForDisplay(textUnit);
                        }}
                      >
                        Rzutuj
                      </Button>
                      <Button
                        color="info"
                        onClick={() => {
                          setSelectedTextUnit(textUnit);
                          setTextUnitAddToQueueDialogOpen(true);
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
            setTextUnitForDisplay(selectedTextUnit);
            handleCloseTextUnitMenu();
          }}
        >
          Rzutuj
        </MenuItem>
        <MenuItem
          onClick={() => {
            setTextUnitAddToQueueDialogOpen(true);
            handleCloseTextUnitMenu();
          }}
        >
          Playlisty
        </MenuItem>
      </Menu>
    </>
  );
};
