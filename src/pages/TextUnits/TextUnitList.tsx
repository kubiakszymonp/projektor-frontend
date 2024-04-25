import {
  Box,
  Button,
  Card,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { textUnitApi, textUnitQueuesApi } from "../../api";
import { TextUnitEditDialog } from "./TextUnitEditDialog";
import { AddTextUnitToQueueDialog } from "./AddTextUnitToQueueDialog";
import { MoreVert } from "@mui/icons-material";
import { TextUnitDto, TextUnitQueueDto } from "../../api/generated";

export const emptyTextUnitObject: TextUnitDto = {
  id: -1,
  title: "",
  content: "",
};

export const TextUnitList: React.FC = () => {
  const [textUnitEditDialogOpen, setTextUnitEditDialogOpen] = useState(false);
  const [textUnitAddToQueueDialogOpen, setTextUnitAddToQueueDialogOpen] =
    useState(false);
  const [textUnitList, setTextUnitList] = useState<TextUnitDto[]>([]);
  const [displayTextUnits, setDisplayTextUnits] = useState<TextUnitDto[]>([]);
  const [queues, setQueues] = useState<TextUnitQueueDto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [editTextUnitDialogTitle, setEditTextUnitDialogTitle] =
    useState<string>("");
  const [currentlyOperatedTextUnit, setCurrentlyOperatedTextUnit] =
    useState<TextUnitDto>(emptyTextUnitObject);

  const fuse = useMemo(
    () =>
      new Fuse(textUnitList, {
        keys: ["title"],
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 1,
      }),
    [textUnitList]
  );

  useEffect(() => {
    fetchTextUnitList();
    fetchQueues();
  }, []);

  useEffect(() => {
    onChangeSearchText();
  }, [searchText, fuse]);

  const handleClose = () => {
    setTextUnitEditDialogOpen(false);
    setTextUnitAddToQueueDialogOpen(false);
    fetchTextUnitList();
    fetchQueues();
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

  const onChangeSearchText = () => {
    if (searchText === "") {
      setDisplayTextUnits(textUnitList);
      return;
    }
    const result = fuse.search(searchText);
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
                px: 5,
                mx: 2,
              }}
              onClick={onAddTextUnit}
            >
              Dodaj
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
                        Dodaj
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
          Dodaj
        </MenuItem>
      </Menu>
    </>
  );
};
