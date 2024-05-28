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
import { displayStateApi, textUnitApi, textUnitQueuesApi, textUnitTagApi } from "../../api";
import { TextUnitEditDialog } from "./TextUnitEditDialog";
import { MoreVert } from "@mui/icons-material";
import { ManageTagsDialog } from "./ManageTagsDialog";
import { GetTextUnitDto, GetTextUnitTagDto } from "../../api/generated";
import { TextUnitAddDialog } from "./TextUnitAddDialog";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export const TextUnitList: React.FC = () => {
  const [textUnitEditDialogOpen, setTextUnitEditDialogOpen] = useState(false);
  const [textUnitCreateDialogOpen, setTextUnitCreateDialogOpen] = useState(false);
  const [manageTagsDialogOpen, setManageTagsDialogOpen] = useState(false);
  const [textUnitList, setTextUnitList] = useState<GetTextUnitDto[]>([]);
  const [displayTextUnits, setDisplayTextUnits] = useState<GetTextUnitDto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [tags, setTags] = useState<GetTextUnitTagDto[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedTextUnit, setSelectedTextUnit] = useState<GetTextUnitDto | null>(
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
    setManageTagsDialogOpen(false);
    setTextUnitCreateDialogOpen(false);
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

  const setTextUnitForDisplay = async (textUnit: GetTextUnitDto | null) => {
    if (!textUnit) return;
    await displayStateApi.displayStateControllerUpdateDisplayState({
      textUnitId: textUnit.id,
      textUnitPart: 0,
      textUnitPartPage: 0,
    });
  };

  const onChangeFilter = () => {
    let filtered: GetTextUnitDto[] = textUnitList;

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

  const onEditTextUnit = (textUnit: GetTextUnitDto) => {
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
      {selectedTextUnit && (
        <TextUnitEditDialog
          open={textUnitEditDialogOpen}
          handleClose={handleClose}
          textUnitId={selectedTextUnit.id}
        />
      )}

      <TextUnitAddDialog
        handleClose={handleClose}
        open={textUnitCreateDialogOpen}
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
                          onEditTextUnit(textUnit);
                        }}
                      >
                        Edytuj
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
            onEditTextUnit(selectedTextUnit!);
            handleCloseTextUnitMenu();
          }}
        >
          Edytuj
        </MenuItem>
      </Menu>
    </>
  );
};
