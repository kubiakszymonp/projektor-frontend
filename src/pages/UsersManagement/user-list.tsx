import { useEffect, useState } from "react";
import { CreateUserDto, GetUserDto, UsersApi } from "../../api/generated";
import { useApi } from "../../services/useApi";
import { MoreVert } from "@mui/icons-material";
import { Card, Stack, Typography, IconButton, Button, useMediaQuery, useTheme, Menu, MenuItem } from "@mui/material";
import { jwtPersistance } from "../../services/jwt-persistance";
import StyledBox from "../../components/page-wrapper";
import { UserCreateDialog } from "./create-user-dialog";
import { UserUpdateDialog } from "./update-user-dialog";

export const UserList: React.FC = () => {

    const { getApi } = useApi();
    const [users, setUsers] = useState<GetUserDto[]>([]);
    const [selectedUser, setSelectedUser] = useState<GetUserDto | null>(null);
    const organizationId = jwtPersistance.getDecodedJwt()?.organizationId;
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        if (!organizationId) return;
        const res = await getApi(UsersApi).userControllerGetUsersForOrganization(organizationId);
        setUsers(res.data);
    }

    const handleClickTextUnitMenu = (el: HTMLElement) => {
        setAnchorEl(el);
    };

    const handleCloseTextUnitMenu = () => {
        setAnchorEl(null);
    };

    const onEditUser = (userId: string) => {
        setSelectedUser(users.find((u) => u.id === userId)!);
        setOpenUpdateDialog(true);
    }


    return (
        <>
            <UserCreateDialog
                handleClose={() => {
                    setOpenCreateDialog(false);
                    fetchUsers();
                }}
                open={openCreateDialog} />
            <UserUpdateDialog
                handleClose={() => {
                    setOpenUpdateDialog(false);
                    fetchUsers();
                }}
                open={openUpdateDialog}
                userId={selectedUser?.id || ""}
            />
            <StyledBox>
                <Typography variant="h4" sx={{ p: 2 }}>
                    Zarządzanie użytkownikami
                </Typography>
                <Button variant="outlined"
                    sx={{
                        m: 2
                    }}
                    onClick={() => {
                        setOpenCreateDialog(true);
                    }}>
                    Dodaj użytkownika
                </Button>
                {users.map((user) => {
                    return (
                        <Card
                            sx={{
                                borderRadius: 2,
                                p: {
                                    xs: 1,
                                    md: 2,
                                },
                                m: 1
                            }}
                            key={user.id}
                        >
                            <Stack
                                direction={"row"}
                                justifyContent={"space-between"}
                                alignItems={"center"}
                            >
                                <Typography
                                    variant={"h6"}
                                    textOverflow={"ellipsis"}
                                    sx={{
                                        width: "100%",
                                        fontSize: {
                                            xs: "0.85rem",
                                            sm: "1.25rem",
                                        },
                                    }}
                                >
                                    {user.email}
                                </Typography>
                                <Stack flexWrap="nowrap" direction="row">
                                    {isXs ? (
                                        <>
                                            <IconButton
                                                onClick={(e) => {
                                                    setSelectedUser(user);
                                                    handleClickTextUnitMenu(e.currentTarget);
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                color="warning"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    onEditUser(user.id);
                                                }}
                                            >
                                                Edytuj
                                            </Button>
                                        </>
                                    )}
                                </Stack>
                            </Stack>
                        </Card>
                    )
                })}
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseTextUnitMenu}
                >
                    <MenuItem
                        onClick={() => {
                            onEditUser(selectedUser?.id || "");
                            handleCloseTextUnitMenu();
                        }}
                    >
                        Edytuj
                    </MenuItem>
                </Menu>
            </StyledBox>
        </>
    )
}