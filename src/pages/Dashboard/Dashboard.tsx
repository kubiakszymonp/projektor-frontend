import {
  CameraAlt,
  Logout,
  LyricsOutlined,
  PermMedia,
  Person,
  QueueOutlined,
  ScreenshotMonitor,
  SettingsApplications,
  SettingsRemoteOutlined,
  SettingsSuggestRounded,
  Tag,
} from "@mui/icons-material";
import { Box, Card, Container, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtPersistance } from "../../services/jwt-persistance";
import { useEffect } from "react";
import StyledBox from "../../components/page-wrapper";

export const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (jwtPersistance.getDecodedJwt() === null) {
      navigate("login");
    }
  }, []);

  const items = [
    {
      icon: <SettingsRemoteOutlined fontSize="large" />,
      title: "Kontroluj wyświetlane treści",
      description:
        "Możliwe przewijanie w przód i tył za pomocą przycisków na ekranie.",
      onClick: () => navigate("/display-controller"),
    },
    {
      icon: <SettingsSuggestRounded fontSize="large" />,
      title: "Konfiguruj ustawienia wyświetlania",
      description:
        "Zmieniaj czcionkę, rozmiar, tło. Dostosuj marginesy, odstępy, kolorystykę.",
      onClick: () => navigate("/display-settings"),
    },
    {
      icon: <LyricsOutlined fontSize="large" />,
      title: "Zarządzaj tekstami",
      description: "Dodawaj, edytuj, usuwaj tekstu. Wyszukuj i zarządzaj.",
      onClick: () => navigate("/text-unit-list"),
    },
    {
      icon: <QueueOutlined fontSize="large" />,
      title: "Kolejki wyświetlania",
      description:
        "Twórz kolejki wyświetlania. Dodawaj, usuwaj, edytuj kolejki.",
      onClick: () => navigate("/text-unit-queue-list"),
    },
    {
      icon: <Tag fontSize="large" />,
      title: "Zarządzanie tagami",
      description:
        "Twórz kolejki wyświetlania. Dodawaj, usuwaj, edytuj kolejki.",
      onClick: () => navigate("/tag-list"),
    },
    {
      icon: <PermMedia fontSize="large" />,
      title: "Wyświetlanie mediów",
      description: "Rzutuj zdjęcia, filmy oraz muzyke na ekran.",
      onClick: () => navigate("/files-manager"),
    },
    {
      icon: <CameraAlt fontSize="large" />,
      title: "Transmisja z kamery",
      description: "Rozpocznij transmisję kamery na ekran.",
      onClick: () => navigate("/stream"),
    },
    {
      icon: <SettingsApplications fontSize="large" />,
      title: "Ustawienia kontrolera",
      description: "",
      onClick: () => {
        navigate("/controller-settings");
      },
    },
    {
      icon: <ScreenshotMonitor fontSize="large" />,
      title: "Tryb ekranu",
      description: "",
      onClick: () => {
        const organizationId = jwtPersistance.getDecodedJwt()?.organizationId;
        navigate("/projector/" + organizationId);
      },
    },
    {
      icon: <Person fontSize="large" />,
      title: "Zarządzanie użytkownikami",
      onClick: () => {
        navigate("users-management");
      },
    },
    {
      icon: <Logout fontSize="large" />,
      title: "Wyloguj",
      onClick: () => {
        jwtPersistance.removeJwt();
        navigate("login");
      }

    }
  ];
  return (
    <StyledBox>
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

    </StyledBox>
  );
};
