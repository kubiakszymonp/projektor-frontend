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
import { useState, useEffect } from "react";
import { textUnitTagApi } from "../../api";
import { TextUnitTagDto } from "../../api/generated";
import { Check, Close, Delete, Edit } from "@mui/icons-material";

export const ManageTagsDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
}> = ({ open, handleClose }) => {
  const [tags, setTags] = useState<TextUnitTagDto[]>([]);
  const [editedTag, setEditedTag] = useState<TextUnitTagDto | null>(null);

  useEffect(() => {
    fetchTags();
    setEditedTag(null);
  }, [open]);

  const fetchTags = async () => {
    const res = await textUnitTagApi.textUnitTagControllerFindAll();
    setTags(res.data);
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

  const deleteTag = async (tag: TextUnitTagDto) => {
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
              const appended = [{ id: -1, name: "", description: "" }, ...tags];
              setTags(appended);
              setEditedTag(appended[0]);
            }}
          >
            Dodaj tag
          </Button>

          {tags.map((tag) => (
            <Card sx={{ borderRadius: 2, p: 2, my: 2 }} key={tag.id}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Anuluj</Button>
        <Button
          onClick={() => {
            debugger;
            console.log({ tags });
            handleClose();
          }}
        >
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};
