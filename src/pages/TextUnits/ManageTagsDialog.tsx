import {
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { textUnitTagApi } from "../../api";
import { Check, Close, Delete, Edit } from "@mui/icons-material";
import { GetTextUnitDto, GetTextUnitTagDto } from "../../api/generated";
import Fuse from "fuse.js";

export const ManageTagsDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
}> = ({ open, handleClose }) => {
  const [allTags, setAllTags] = useState<GetTextUnitTagDto[]>([]);
  const [editedTag, setEditedTag] = useState<GetTextUnitTagDto | null>(null);
  const [searchTextUnitTagsText, setSearchTextUnitTagsText] = useState<string>("");

  useEffect(() => {
    fetchTags();
    setEditedTag(null);
  }, [open]);


  const filteredTags = useMemo(() => {
    if (searchTextUnitTagsText === "") return allTags;
    const result = new Fuse(allTags, {
      keys: ["name"],
      includeScore: true,
      shouldSort: true,
      minMatchCharLength: 1,
    })
      .search(searchTextUnitTagsText)
      .map((result) => result.item);

    return result;
  }, [allTags, searchTextUnitTagsText]);

  const fetchTags = async () => {
    const res = await textUnitTagApi.textUnitTagControllerFindAll();
    setAllTags(res.data);
    setEditedTag(null);
  };

  const saveTag = async () => {
    if (!editedTag) return;
    if (editedTag.id === -1) {
      await textUnitTagApi.textUnitTagControllerCreate({
        ...editedTag,
      });
    } else {
      await textUnitTagApi.textUnitTagControllerUpdate(String(editedTag.id), {
        ...editedTag,
      });
    }
    fetchTags();
  };

  const deleteTag = async (tag: GetTextUnitTagDto) => {
    await textUnitTagApi.textUnitTagControllerRemove(String(tag.id));
    fetchTags();
  };

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>Zarządzanie tagami</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 3 }}>

          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              if (editedTag?.id === -1) return;
              const appended = [{ id: -1, name: "", description: "" }, ...allTags];
              setAllTags(appended);
              setEditedTag(appended[0]);
            }}

            style={{
              marginBottom: "1rem",
            }}
          >
            Dodaj tag
          </Button>
          <TextField
            fullWidth
            id="outlined-multiline-static"
            label="Wyszukaj tagi"
            value={searchTextUnitTagsText}
            onChange={(e) => {
              setSearchTextUnitTagsText(e.target.value);
            }}
          />
          <Box sx={{
            height: 400,
            overflowY: "auto",
            my: 2,
          }}>
            {filteredTags.map((tag) => (
              <Card sx={{ borderRadius: 2, p: 2, my: 1 }} key={tag.id}>
                <Stack
                  direction={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  {editedTag?.id !== tag.id && (
                    <>
                      <Typography
                        variant={"h6"}
                        textOverflow={"ellipsis"}
                        noWrap
                        sx={{
                          fontSize: {
                            xs: "0.85rem", // For xs breakpoints and below
                            sm: "1.25rem", // For sm breakpoints and above
                          },
                        }}
                      >
                        {tag.name}
                      </Typography>
                      <Box>
                        <IconButton
                          color="warning"
                          onClick={() => {
                            setEditedTag({ ...tag });
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            deleteTag(tag);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </>
                  )}
                  {editedTag?.id === tag.id && (
                    <>
                      <TextField
                        fullWidth
                        required
                        size="medium"
                        id="outlined-multiline-static"
                        label="Nazwa tagu"
                        value={editedTag.name}
                        onChange={(e) => {
                          setEditedTag({ ...tag, name: e.target.value });
                        }}
                      />
                      {/* // save Iconbutton */}
                      <IconButton color="success" onClick={saveTag}>
                        <Check />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setEditedTag(null);
                          fetchTags();
                        }}
                      >
                        <Close />
                      </IconButton>
                    </>
                  )}
                </Stack>
              </Card>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Anuluj</Button>
        <Button
          onClick={() => {
            handleClose();
          }}
        >
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};
