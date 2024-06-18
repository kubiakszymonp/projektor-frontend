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


export const UserUpdateDialog: React.FC<{
    open: boolean;
    handleClose: () => void;
    userId: string;
}> = ({ open, handleClose, userId }) => {
    const [user, setUser] = useState<CreateUserDto>();
    const { getApi } = useApi();

    useEffect(() => {
        if (open)
            loadTextUnit();
    }, [open]);

    const loadTextUnit = async () => {
        const res = await getApi(UsersApi).userControllerGetUserById(userId);
        setUser(res.data as any)
    };

    const handleDelete = async () => {
        await getApi(UsersApi).userControllerDeleteUser(userId);
        handleClose();
    };

    const onSave = async () => {
        if (!user) return;
        await getApi(UsersApi).userControllerUpdateUser({ ...user, id: userId });
        handleClose();
    };

    return (
        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>
                Edytuj użytkownika
            </DialogTitle>
            <DialogContent>
                {user && (
                    <UserInputs setUser={setUser} user={user} />
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    color="error"
                    onClick={handleDelete}
                >
                    Usuń
                </Button>
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
