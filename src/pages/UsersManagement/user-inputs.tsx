import { TextField } from "@mui/material";
import { CreateUserDto } from "../../api/generated"

export const UserInputs: React.FC<{
    user: CreateUserDto,
    setUser: (user: CreateUserDto) => void
}> = ({ user, setUser }) => {

    return (
        <>
            <TextField
                required
                id="email"
                name="email"
                label="Adres email"
                type="text"
                fullWidth
                variant="standard"
                value={user.email}
                onChange={(e) => {
                    setUser({ ...user, email: e.target.value });
                }}
            />
            <TextField
                required
                id="name"
                name="name"
                label="Imię i nazwisko"
                type="text"
                fullWidth
                variant="standard"
                value={user.name}
                onChange={(e) => {
                    setUser({ ...user, name: e.target.value });
                }}
            />
            <TextField
                required
                id="password"
                name="password"
                label="Hasło"
                type="text"
                fullWidth
                variant="standard"
                value={user.password}
                onChange={(e) => {
                    setUser({ ...user, password: e.target.value });
                }}
            />
        </>
    )
}