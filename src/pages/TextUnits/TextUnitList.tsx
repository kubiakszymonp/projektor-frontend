import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
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
import { TextUnitEditDialog } from "./TextUnitEditDialog";
import { ExpandMore, MoreVert } from "@mui/icons-material";
import { DisplayStateApi, GetTextUnitDto, GetTextUnitTagDto, TextUnitsApi } from "../../api/generated";
import { TextUnitAddDialog } from "./TextUnitAddDialog";
import StyledBox from "../../components/page-wrapper";
import { TextUnitFiltering } from "./text-unit-filtering";
import { useApi } from "../../services/useApi";
import { NavBar } from "../../components/nav-bar";


export const TextUnitList: React.FC = () => {
  const [textUnitEditDialogOpen, setTextUnitEditDialogOpen] = useState(false);
  const [textUnitCreateDialogOpen, setTextUnitCreateDialogOpen] = useState(false);
  const [textUnitList, setTextUnitList] = useState<GetTextUnitDto[]>([]);
  const [displayTextUnits, setDisplayTextUnits] = useState<GetTextUnitDto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<GetTextUnitTagDto[]>([]);
  const [selectedTextUnit, setSelectedTextUnit] = useState<GetTextUnitDto | null>(
    null
  );

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { getApi } = useApi();

  useEffect(() => {
    closeAllModalsAndRefresh();
  }, []);

  useEffect(() => {
    onChangeFilter();
  }, [searchText, selectedTags, textUnitList]);

  const closeAllModalsAndRefresh = () => {
    closeAllModals();
    refreshData();
  };

  const refreshData = () => {
    fetchTextUnitList();
  };

  const closeAllModals = () => {
    setTextUnitEditDialogOpen(false);
    setTextUnitCreateDialogOpen(false);
  };

  const handleClickTextUnitMenu = (el: HTMLElement) => {
    setAnchorEl(el);
  };

  const handleCloseTextUnitMenu = () => {
    setAnchorEl(null);
  };

  const fetchTextUnitList = async () => {
    const res = await getApi(TextUnitsApi).textUnitControllerFindAll();
    setTextUnitList(res.data);
  };

  const setTextUnitForDisplay = async (textUnit: GetTextUnitDto | null) => {
    if (!textUnit) return;
    await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
      textUnitId: textUnit.id,
      textUnitPart: 0,
      textUnitPartPage: 0,
    });
  };

  const onChangeFilter = () => {
    let filtered: GetTextUnitDto[] = textUnitList;

    if (selectedTags.length > 0) {
      const selectedTagIds = selectedTags.map((tag) => tag.id);
      filtered = textUnitList.filter((textUnit) =>
        textUnit.tags.some((tag) => selectedTagIds.includes(tag.id))
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
    setTextUnitCreateDialogOpen(true);
  };

  const onEditTextUnit = (textUnit: GetTextUnitDto) => {
    setSelectedTextUnit(textUnit);
    setTextUnitEditDialogOpen(true);
  };

  return (
    <>
      <NavBar />
      {selectedTextUnit && (
        <TextUnitEditDialog
          open={textUnitEditDialogOpen}
          handleClose={closeAllModalsAndRefresh}
          textUnitId={selectedTextUnit.id}
        />
      )}

      <TextUnitAddDialog
        handleClose={closeAllModalsAndRefresh}
        open={textUnitCreateDialogOpen}
      />
      <StyledBox>
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
        <Box sx={{
          pt: 2,
        }}>
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              Filtry wyszukiwania
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={"row"}>
                <TextUnitFiltering selectedTags={selectedTags} setSelectedTags={setSelectedTags}></TextUnitFiltering>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
        <Stack direction="row" flexWrap={"wrap"} sx={{ pt: 3 }} spacing={1}>
          {selectedTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              variant="outlined"
              style={{
                marginBottom: "0.5rem"
              }}
            />
          ))}
        </Stack>
        <Stack
          direction={"column"}
          sx={{
            mt: 1,
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
                        color="warning"
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
      </StyledBox>
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
