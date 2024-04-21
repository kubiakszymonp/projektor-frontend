import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { UploadedFileDto } from "../../api/generated";
import { UPLOAD_ROOT } from "../../api";

export const FilePreviewModal: React.FC<{
  open: boolean;
  handleClose: () => void;
  currentFile: UploadedFileDto | null;
  nextFile: () => void;
  previousFile: () => void;
}> = ({ open, handleClose, currentFile, nextFile, previousFile }) => {
  return (
    <>
      {currentFile && (
        <Dialog fullWidth open={open} onClose={handleClose}>
          <DialogTitle>{currentFile.name}</DialogTitle>
          <DialogContent sx={{p:1}}>
            <Box>
              <img
                src={UPLOAD_ROOT + currentFile.url}
                style={{ maxWidth: "100%", maxHeight: "100%" }}
                alt={currentFile.name}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              sx={{ width: "100%" , mx:3}}
            >
              <Button onClick={previousFile}>Poprzedni</Button>
              <Button onClick={nextFile}>Następny</Button>
            </Stack>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
