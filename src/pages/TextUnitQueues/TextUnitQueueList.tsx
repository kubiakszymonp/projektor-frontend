import React, { useEffect, useMemo, useState } from "react";
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
import { TextUnitQueueEditDialog } from "./TextUnitQueueUpdateDialog";
import { MoreVert } from "@mui/icons-material";
import { DisplayStateApi, GetDisplayQueueDto, GetTextUnitDto, TextUnitQueuesApi } from "../../api/generated";
import { TextUnitQueueCreateDialog } from "./TextUnitQueueCreateDialog";
import StyledBox from "../../components/page-wrapper";
import { useApi } from "../../services/useApi";
import { NavBar } from "../../components/nav-bar";

export const TextUnitQueueList = () => {
  const [allDisplayQueues, setAllDisplayQueues] = useState<GetDisplayQueueDto[]>([]);
  const [filteredDisplayQueues, setFilteredDisplayQueues] = useState<GetDisplayQueueDto[]>([]);
  const [selectedDisplayQueue, setSelectedDisplayQueue] =
    useState<GetDisplayQueueDto | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [textUnitQueueEditDialogOpen, setTextUnitQueueEditDialogOpen] =
    useState(false);
  const [displayQueueCreateDialogOpen, setDisplayQueueCreateDialogOpen] = useState(false);
  const { getApi } = useApi();

  useEffect(() => {
    fetchTextUnitQueues();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(allDisplayQueues, {
        keys: ["name"],
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 1,
      }),
    [allDisplayQueues]
  );

  useEffect(() => {
    onChangeSearchText();
  }, [searchText, fuse]);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClickTextUnitMenu = (el: HTMLElement) => {
    setAnchorEl(el);
  };

  const handleCloseTextUnitMenu = () => {
    setAnchorEl(null);
  };

  const onChangeSearchText = () => {
    if (searchText === "") {
      setFilteredDisplayQueues(allDisplayQueues);
      return;
    }
    const result = fuse.search(searchText);
    setFilteredDisplayQueues(result.map((r) => r.item));
  };

  const fetchTextUnitQueues = async () => {
    const queues = await getApi(TextUnitQueuesApi).displayQueuesControllerFindAll();
    setAllDisplayQueues(queues.data);
  };

  const onAddTextUnitQueue = async () => {
    setDisplayQueueCreateDialogOpen(true);
  };

  const onEditTextUnitQueue = (queue: GetDisplayQueueDto) => {
    setSelectedDisplayQueue(queue);
    setTextUnitQueueEditDialogOpen(true);

  };

  const setCurrentQueue = async (queue: GetDisplayQueueDto) => {
    await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
      textUnitQueueId: queue.id,
    })
  };

  return (
    <>
      <NavBar />
      {selectedDisplayQueue && (
        <TextUnitQueueEditDialog
          textUnitQueueId={selectedDisplayQueue.id}
          handleClose={() => {
            setTextUnitQueueEditDialogOpen(false);
            fetchTextUnitQueues();
          }}
          open={textUnitQueueEditDialogOpen}
        />
      )}
      <TextUnitQueueCreateDialog handleClose={() => {
        setDisplayQueueCreateDialogOpen(false);
        fetchTextUnitQueues();
      }}
        open={displayQueueCreateDialogOpen}
      />

      <StyledBox>
        <Box>
          <Stack direction={"row"}>
            <TextField
              fullWidth
              id="text-unit-content"
              label="Wyszukaj kolejkę tekstów"
              variant="outlined"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              variant="outlined"
              sx={{
                px: 5,
                mx: 2,
              }}
              onClick={onAddTextUnitQueue}
            >
              Dodaj
            </Button>
          </Stack>
        </Box>
        <Box>
          {filteredDisplayQueues.map((queue) => (
            <Card
              sx={{
                borderRadius: 2,
                p: {
                  xs: 1,
                  md: 2,
                },
                my: 2,
              }}
              key={queue.id}
            >
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography
                  variant={"h6"}
                  textOverflow={"ellipsis"}
                  noWrap
                  sx={{
                    fontSize: {
                      xs: "0.85rem", // For xs breakpoints and below
                      sm: "1.25rem", // For sm breakpoints and above
                      // Add more breakpoints as needed
                    },
                  }}
                >
                  {queue.name}
                </Typography>
                <Stack flexWrap="nowrap" direction="row">
                  {isXs ? (
                    <>
                      <IconButton
                        onClick={(e) => {
                          setTextUnitQueueEditDialogOpen(true)
                          handleClickTextUnitMenu(e.currentTarget)
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Button
                        color="info"
                        onClick={() => setCurrentQueue(queue)}
                      >
                        Rzutuj
                      </Button>
                      <Button
                        color="warning"
                        onClick={() => onEditTextUnitQueue(queue)}
                      >
                        Edytuj
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}

          <Menu
            elevation={0}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseTextUnitMenu}
          >
            <MenuItem
              onClick={() => {
                handleCloseTextUnitMenu();
              }}
            >
              Rzutuj
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseTextUnitMenu();
              }}
            >
              Edytuj
            </MenuItem>
          </Menu>
        </Box>
      </StyledBox>
    </>
  );
};

export interface DragAndDropItem {
  text: string;
  key: string;
}
