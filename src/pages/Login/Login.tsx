import React, { useEffect } from "react";
import { ThemeProvider } from "@emotion/react";
import { LockOutlined } from "@mui/icons-material";
import {
  Container,
  CssBaseline,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Link,
  createTheme,
} from "@mui/material";
import { jwtPersistance } from "../../services/jwt-persistance";
import { useNavigate } from "react-router-dom";
import { setPageTitle } from "../../services/page-title";
import { TransitionAlert } from "../../components/alert.component";
import { useApi } from "../../services/useApi";
import { AuthApi } from "../../api/generated";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit">Rzutnik</Link> {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle("Logowanie");
  }, []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const { getApi } = useApi();

  const handleSubmit = () => {
    getApi(AuthApi)
      .authControllerLogin({
        email,
        password,
      })
      .then((res) => {
        const jwt = res.data;
        jwtPersistance.saveJwt(jwt);
        navigate("/");
      })
      .catch((er) => {
        setErrorMessage("Błędne dane logowania!");
      });
  };
  return (
    <ThemeProvider theme={defaultTheme}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          justifyContent: "center",
        }}
      >
        <Container component="main" maxWidth="md">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              Logowanie kontrolera
            </Typography>
            <Box
              component="form"
              noValidate
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              sx={{ mt: 1, pt: 3 }}
            >
              <TransitionAlert
                opened={errorMessage.length > 0}
                text={errorMessage}
                severity={"error"}
              />
              <TextField
                inputProps={{
                  form: {
                    autocomplete: "off",
                  },
                }}
                margin="normal"
                required
                fullWidth
                name="email"
                label="Email"
                type="text"
                id="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <TextField
                inputProps={{
                  form: {
                    autocomplete: "off",
                  },
                }}
                margin="normal"
                required
                fullWidth
                name="password"
                label="Hasło"
                type="password"
                id="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              <Button
                onClick={handleSubmit}
                fullWidth
                size="large"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Logowanie
              </Button>
            </Box>
          </Box>
          <Copyright sx={{ mt: 5, mb: 4 }} />
        </Container>
      </div>
    </ThemeProvider>
  );
};
