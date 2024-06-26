import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { MoreVert } from "@mui/icons-material";
import { DisplayStateApi, GetMediaFileDto } from "../../api/generated";
import { useApi } from "../../services/useApi";

export const FilePreviewModal: React.FC<{
  open: boolean;
  handleClose: () => void;
  currentFile: GetMediaFileDto | null;
  nextFile: () => void;
  previousFile: () => void;
  refresh: () => void;
}> = ({ open, handleClose, currentFile, nextFile, previousFile, refresh }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { getStaticResourceUrl, getApi } = useApi();

  const handleClickFileMenu = (el: HTMLElement) => {
    setAnchorEl(el);
  };

  const handleCloseFileMenu = () => {
    setAnchorEl(null);
  };

  const setAsCurrentCastingFile = async () => {
    await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
      mediaFileId: currentFile?.id,
    });
    refresh();
  };

  return (
    <>
      {currentFile && (
        <Dialog fullWidth open={open} onClose={handleClose}>
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {currentFile.name}
            </Typography>
            <IconButton
              onClick={(e) => {
                handleClickFileMenu(e.currentTarget);
              }}
            >
              <MoreVert />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 1 }}>
            <Box>
              <img
                src={getStaticResourceUrl(currentFile.url)}
                style={{ maxWidth: "100%", maxHeight: "100%" }}
                alt={currentFile.name}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              sx={{ width: "100%", mx: 3 }}
            >
              <Button onClick={previousFile}>Poprzedni</Button>
              <Button onClick={nextFile}>Następny</Button>
            </Stack>
          </DialogActions>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseFileMenu}
          >
            <MenuItem
              onClick={() => {
                setAsCurrentCastingFile();
              }}
            >
              Rzutuj
            </MenuItem>
          </Menu>
        </Dialog>
      )}
    </>
  );
};
