import { FormControlLabel, Checkbox, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { DisplayStateApi, GetDisplayDtoDisplayTypeEnum, GetDisplayStateDto } from "../../api/generated";
import { useApi } from "../../services/useApi";

export const GeneralDisplayController: React.FC<{
    displayState: GetDisplayStateDto,
}> = ({ displayState }) => {

    const { getApi } = useApi();

    const setScreenOnOff = async (off: boolean) => {
        await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
            emptyDisplay: off,
        });
    };

    const setDisplayType = async (type: GetDisplayDtoDisplayTypeEnum) => {
        await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
            displayType: type,
        });
    }

    return (
        <>
            {displayState && (
                <>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={displayState.emptyDisplay}
                                sx={{ "& .MuiSvgIcon-root": { fontSize: 32 } }}
                            />
                        }
                        label="Wygaś ekran"
                        onChange={(_, checked) => {
                            setScreenOnOff(checked);
                        }}
                    />
                    <FormControl fullWidth sx={{ my: 2 }}>
                        <InputLabel id="demo-simple-select-label">Typ treści</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={displayState.displayType}
                            label="Typ treści"
                            onChange={(e) => {
                                const value = e.target.value as GetDisplayDtoDisplayTypeEnum;
                                setDisplayType(value)
                            }}
                        >
                            <MenuItem value={GetDisplayDtoDisplayTypeEnum.Text}>Pieśni</MenuItem>
                            <MenuItem value={GetDisplayDtoDisplayTypeEnum.Media}>Media</MenuItem>
                            <MenuItem value={GetDisplayDtoDisplayTypeEnum.WebRtc}>Transmisja</MenuItem>
                        </Select>
                    </FormControl>

                </>
            )}
        </>);
}