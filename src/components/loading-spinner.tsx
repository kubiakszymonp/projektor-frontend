import { Box, CircularProgress } from "@mui/material";
import { useLoading } from "./loading/loading-context";

export const LoadingSpinner: React.FC = () => {
  const { isLoading } = useLoading();
  return (
    <Box
      sx={{
        visibility: isLoading ? "visible" : "hidden",
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#06090a",
        position: "fixed",
        zIndex: 1000,
      }}
    >
      <CircularProgress />
    </Box>
  );
};
