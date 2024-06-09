import { FormControl, Stack, TextField, Typography } from "@mui/material";
import StyledBox from "../../components/page-wrapper";
import { useContext, useState } from "react";
import { ServerContext } from "../../services/api-server-context";
import { Check, Clear } from "@mui/icons-material";

export const ControllerSettings: React.FC = () => {

    const {
        wanServiceApiUrl,
        setWanServiceApiUrl,
        lanServiceApiUrl,
        setLanServiceApiUrl,
        isWanConnected,
        isLanConnected,
    } = useContext(ServerContext);

    return (<StyledBox>
        <Typography variant="h6" sx={{ mb: 2 }}>
            Adres internetowego serwisu
        </Typography>
        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <FormControl sx={{ flex: 1 }}>
                <TextField
                    id="outlined-basic"
                    label="Adres internetowego serwisu"
                    variant="outlined"
                    value={wanServiceApiUrl}
                    onChange={(e) => {
                        setWanServiceApiUrl(e.target.value);
                    }}
                />
            </FormControl>
            <ConnectionState ok={isWanConnected}></ConnectionState>
        </Stack>
        <Typography variant="h6" sx={{ mb: 2 }}>
            Adres lokalnego serwisu projektora
        </Typography>
        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <FormControl sx={{ flex: 1 }}>
                <TextField
                    id="outlined-basic"
                    label={"Adres lokalnego serwisu projektora"}
                    variant="outlined"
                    value={lanServiceApiUrl}
                    onChange={(e) => {
                        setLanServiceApiUrl(e.target.value);
                    }}
                />
            </FormControl>
            <ConnectionState ok={isLanConnected}></ConnectionState>
        </Stack>
    </StyledBox>);
}


export const ConnectionState: React.FC<{ ok: boolean }> = ({ ok }) => {

    return (
        <div style={{ paddingInline: "1rem" }}>
            {ok ? <Check sx={{
                color: "green",
                fontSize: "2rem"
            }} /> : <Clear sx={{
                color: "red",
                fontSize: "2rem"
            }} />}
        </div>
    )
}