import { Button, Card, Stack, Typography } from "@mui/material";
import StyledBox from "../../components/page-wrapper";
import { useEffect, useState } from "react";
import { Stores, User, addData, deleteData, getStoreData, initDB } from "./db";
import { useApi } from "../../services/useApi";
import { BackupApi } from "../../api/generated";

export interface Backup {
    id: string;
    backupData: string;
}

export const Synchronization: React.FC = () => {
    const [backups, setBackups] = useState<Backup[]>([]);
    const { getApi } = useApi();

    useEffect(() => {
        handleInitDB().then(() => getBackups());
    }, []);

    const handleInitDB = async () => {
        await initDB(Stores.Backup);
    };

    const handleAddBackup = async () => {

        const response = await getApi(BackupApi).backupControllerFetchBackup();

        await addData<Backup>(Stores.Backup, { id: new Date().getTime().toString(), backupData: response.data.backup });
        getBackups();
    }

    const removeBackups = async (id: string) => {
        await deleteData(Stores.Backup, id);
        getBackups();
    };

    const getBackups = async () => {
        const backups = await getStoreData<Backup>(Stores.Backup);
        setBackups(backups);
    }

    const applyBackup = async (backup: Backup) => {
        const data = backup.backupData;
        getApi(BackupApi).backupControllerApplyBackup({
            backup: data
        });
    };

    return (
        <StyledBox>
            <Typography variant="h4" sx={{ p: 2 }}>
                Synchronizacja
            </Typography>
            <Button
                onClick={handleAddBackup}
                variant="contained"
                color="primary">
                Pobierz zsynchronizowane dane
            </Button>

            {backups.map((backup) => (
                <Card key={backup.id} sx={{
                    m: 1,
                    p: 1
                }}>
                    <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                        <Typography>{new Date(parseInt(backup.id)).toLocaleDateString() + " " + new Date(parseInt(backup.id)).toLocaleTimeString()}</Typography>
                        <div>
                            <Button sx={{
                                m: 1
                            }} variant="outlined" onClick={() => {
                                applyBackup(backup)
                            }}>Zastosuj</Button>
                            <Button sx={{
                                m: 1
                            }} variant="outlined" color="error" onClick={() => removeBackups(backup.id)}>Usuń</Button>
                        </div>
                    </Stack>
                </Card>
            ))}
        </StyledBox>
    );
};
