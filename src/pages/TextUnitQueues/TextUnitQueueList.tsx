import React, { useEffect, useMemo, useState } from "react";
import { textUnitQueuesApi } from "../../api";
import { TextUnitQueueDto } from "../../api/generated";
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
import { TextUnitQueueEditDialog } from "./TextUnitQueueEditDialog";
import { MoreVert } from "@mui/icons-material";

export const TextUnitQueueList = () => {
  const [textUnitQueues, setTextUnitQueues] = useState<TextUnitQueueDto[]>([]);
  const [displayQueues, setDisplayQueues] = useState<TextUnitQueueDto[]>([]);
  const [selectedTextUnitQueue, setSelectedTextUnitQueue] =
    useState<TextUnitQueueDto | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [textUnitQueueEditDialogOpen, setTextUnitQueueEditDialogOpen] =
    useState(false);

  useEffect(() => {
    fetchTextUnitQueues();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(textUnitQueues, {
        keys: ["name"],
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 1,
      }),
    [textUnitQueues]
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
      setDisplayQueues(textUnitQueues);
      return;
    }
    const result = fuse.search(searchText);
    setDisplayQueues(result.map((r) => r.item));
  };

  const fetchTextUnitQueues = async () => {
    const queues = await textUnitQueuesApi.textUnitQueuesControllerFindAll();
    setTextUnitQueues(queues.data);
  };

  const onAddTextUnitQueue = async () => {
    setSelectedTextUnitQueue(null);
    setTextUnitQueueEditDialogOpen(true);
  };

  const onEditTextUnitQueue = (id: number) => {
    const textUnitQueue = textUnitQueues.find((queue) => queue.id === id);
    if (textUnitQueue) {
      setSelectedTextUnitQueue(textUnitQueue);
      setTextUnitQueueEditDialogOpen(true);
    }
  };

  const setCurrentQueue = async (queue: TextUnitQueueDto) => {
    await textUnitQueuesApi.textUnitQueuesControllerSetCurrentTextUnitQueue({
      id: queue.id,
    });
  };

  return (
    <>
      <TextUnitQueueEditDialog
        textUnitQueueId={selectedTextUnitQueue?.id ?? null}
        handleClose={() => {
          setTextUnitQueueEditDialogOpen(false);
          fetchTextUnitQueues();
        }}
        open={textUnitQueueEditDialogOpen}
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
          {displayQueues.map((queue) => (
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
                        onClick={(e) =>
                          handleClickTextUnitMenu(e.currentTarget)
                        }
                      >
                        <MoreVert />
                      </IconButton>
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
                            setCurrentQueue(queue);
                            handleCloseTextUnitMenu();
                          }}
                        >
                          Rzutuj
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            onEditTextUnitQueue(queue.id!);
                            handleCloseTextUnitMenu();
                          }}
                        >
                          Edytuj
                        </MenuItem>
                      </Menu>
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
                        onClick={() => onEditTextUnitQueue(queue.id!)}
                      >
                        Edytuj
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Box>
      </Box>
    </>
  );
};

export interface DragAndDropItem {
  text: string;
  key: string;
}
