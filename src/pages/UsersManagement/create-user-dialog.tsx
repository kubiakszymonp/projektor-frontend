import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CreateUserDto, UsersApi } from "../../api/generated";
import { useApi } from "../../services/useApi";
import { UserInputs } from "./user-inputs";
import { jwtPersistance } from "../../services/jwt-persistance";


export const UserCreateDialog: React.FC<{
    open: boolean;
    handleClose: () => void;
}> = ({ open, handleClose }) => {

    const organizationId = jwtPersistance.getDecodedJwt()?.organizationId;
    const [user, setUser] = useState<CreateUserDto>({
        email: "",
        name: "",
        password: "",
        organizationId: organizationId || "",
    });
    const { getApi } = useApi();

    useEffect(() => {
        if (open) {
            setUser({
                email: "",
                name: "",
                password: "",
                organizationId: organizationId || "",
            });
        }

    }, [open]);


    const onSave = async () => {
        if (!user) return;
        await getApi(UsersApi).userControllerCreateUser({ ...user });
        handleClose();
    };

    return (
        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>
                Dodaj użytkownika
            </DialogTitle>
            <DialogContent>
                {user && (
                    <UserInputs setUser={setUser} user={user} />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Anuluj</Button>
                <Button
                    color="success"
                    onClick={onSave}
                >
                    Zapisz
                </Button>
            </DialogActions>
        </Dialog>
    );
};
