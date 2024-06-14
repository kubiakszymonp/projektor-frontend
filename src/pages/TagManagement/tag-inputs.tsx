import { TextField } from "@mui/material";
import { CreateTextUnitTagDto } from "../../api/generated";

export const TagInputs: React.FC<{
    tag: CreateTextUnitTagDto,
    setTag: (textUnit: CreateTextUnitTagDto) => void
}> = ({
    tag, setTag
}) => {
        return (<TextField
            required
            id="title"
            name="title"
            label="Nazwa tagu"
            type="text"
            fullWidth
            variant="standard"
            value={tag.name}
            onChange={(e) => {
                setTag({ ...tag, name: e.target.value });
            }}
        />)
    }