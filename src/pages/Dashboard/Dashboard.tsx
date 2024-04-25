import {
  CameraAlt,
  LyricsOutlined,
  PermMedia,
  QueueOutlined,
  ScreenshotMonitor,
  SettingsRemoteOutlined,
  SettingsSuggestRounded,
} from "@mui/icons-material";
import { Box, Card, Container, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtPersistance } from "../../services/jwt-persistance";

export const Dashboard = () => {
  const navigate = useNavigate();

  const items = [
    {
      icon: <SettingsRemoteOutlined fontSize="large"/>,
      title: "Kontroluj wyświetlane treści",
      description:
        "Możliwe przewijanie w przód i tył za pomocą przycisków na ekranie.",
      onClick: () => navigate("/display-controller"),
    },
    {
      icon: <SettingsSuggestRounded fontSize="large"/>,
      title: "Konfiguruj ustawienia wyświetlania",
      description:
        "Zmieniaj czcionkę, rozmiar, tło. Dostosuj marginesy, odstępy, kolorystykę.",
      onClick: () => navigate("/display-settings"),
    },
    {
      icon: <LyricsOutlined fontSize="large"/>,
      title: "Zarządzaj tekstami",
      description: "Dodawaj, edytuj, usuwaj tekstu. Wyszukuj i zarządzaj.",
      onClick: () => navigate("/text-unit-list"),
    },
    {
      icon: <QueueOutlined fontSize="large"/>,
      title: "Kolejki wyświetlania",
      description:
        "Twórz kolejki wyświetlania. Dodawaj, usuwaj, edytuj kolejki.",
      onClick: () => navigate("/text-unit-queue-list"),
    },
    {
      icon: <PermMedia fontSize="large"/>,
      title: "Wyświetlanie mediów",
      description: "Rzutuj zdjęcia, filmy oraz muzyke na ekran.",
      onClick: () => navigate("/files-manager"),
    },
    {
      icon: <CameraAlt fontSize="large"/>,
      title: "Transmisja z kamery",
      description: "Rozpocznij transmisję kamery na ekran.",
      onClick: () => navigate("/stream"),
    },
    {
      icon: <ScreenshotMonitor fontSize="large"/>,
      title: "Tryb ekranu",
      description: "",
      onClick: () => {
        const organizationId = jwtPersistance.getDecodedJwt()?.id;
        navigate("/projector/" + organizationId);
      },
    },
  ];
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: "white",
        bgcolor: "#06090a",
        height: " 100%",
        minHeight: "100vh",
      }}
    >
      <Container
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: "100%", md: "60%" },
            textAlign: { xs: "center" },
          }}
        >
          <Typography component="h2" variant="h4">
            Panel sterowania
          </Typography>
          <Typography variant="body1" sx={{ color: "grey.400" }}>
            Zarządzaj wyświetlaniem treści na ekranie. Dodawaj nowe teksty,
            edytuj istniejące, usuwaj. Twórz kolejki wyświetlania. Modyfikuj
            ustawienia wyświetlacza.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Stack
                direction="column"
                color="inherit"
                component={Card}
                spacing={5}
                useFlexGap
                onClick={item.onClick}
                sx={{
                  boxSizing: "border-box",
                  py: 3,
                  px: 3,
                  height: "100%",
                  border: "2px solid",
                  borderColor: "grey.800",
                  background: "transparent",
                  backgroundColor: "grey.900",
                }}
              >
                <Box sx={{ opacity: "50%" }}>{item.icon}</Box>
                <div>
                  <Typography fontWeight="medium" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "grey.400" }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
