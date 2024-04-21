import * as React from "react";
import Box from "@mui/material/Box";
import Alert, { AlertColor } from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";

export const TransitionAlert: React.FC<{
  text: string;
  opened: boolean;
  severity: AlertColor;
}> = ({ text, opened, severity }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Collapse in={opened}>
        <Alert
          variant="outlined"
          severity={severity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
            ></IconButton>
          }
          sx={{ my: 2 }}
        >
          {text}
        </Alert>
      </Collapse>
    </Box>
  );
};
