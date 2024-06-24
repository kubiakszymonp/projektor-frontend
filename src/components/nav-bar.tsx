import { Home } from "@mui/icons-material";
import { AppBar, Toolbar, IconButton, Typography, Button } from "@mui/material";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const NavBar: React.FC = () => {

    const navigate = useNavigate();

    const navigateHome = useCallback(() => {
        navigate("/");
    }, []);

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={navigateHome}
                    >
                        <Home />
                    </IconButton>
                    <Typography variant="h6" onClick={navigateHome}>
                        eprojektor.pl
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    );
}