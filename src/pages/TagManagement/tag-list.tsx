import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import Fuse from "fuse.js";

import { MoreVert } from "@mui/icons-material";
import { GetDisplayQueueDto, GetTextUnitDto, GetTextUnitTagDto, TextUnitTagApi } from "../../api/generated";

import StyledBox from "../../components/page-wrapper";
import { TagCreateDialog } from "./tag-create-dialog";
import { TagEditDialog } from "./tag-edit-dialog";
import { useApi } from "../../services/useApi";
import { NavBar } from "../../components/nav-bar";

export const TagList = () => {

    const [allTags, setAllTags] = useState<GetTextUnitTagDto[]>([]);
    const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [editTagDialogOpen, setEditTagDialogOpen] = useState(false);
    const [createTagDialogOpen, setCreateTagDialogOpen] = useState(false);
    const { getApi } = useApi();

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        const res = await getApi(TextUnitTagApi).textUnitTagControllerFindAll();
        setAllTags(res.data);
    };

    const filteredTags = useMemo(() => {
        if (searchText === "") return allTags;
        const result = new Fuse(allTags, {
            keys: ["name"],
            includeScore: true,
            shouldSort: true,
            minMatchCharLength: 1,
        })
            .search(searchText)
            .map((result) => result.item);

        return result;

    }, [allTags, searchText]);


    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleClickTextUnitMenu = (el: HTMLElement) => {
        setAnchorEl(el);
    };

    const handleCloseTextUnitMenu = () => {
        setAnchorEl(null);
    };

    const onAddTextUnitQueue = async () => {
        setCreateTagDialogOpen(true);
    };

    const onEditTextUnitQueue = (tagId: string) => {
        setSelectedTagId(tagId);
        setEditTagDialogOpen(true);

    };

    return (
        <>
            <NavBar />
            {selectedTagId && (
                <TagEditDialog
                    tagId={selectedTagId}
                    handleClose={() => {
                        setEditTagDialogOpen(false);
                        fetchTags();
                    }}
                    open={editTagDialogOpen}
                />
            )}
            <TagCreateDialog
                handleClose={() => {
                    setCreateTagDialogOpen(false);
                    fetchTags();
                }}
                open={createTagDialogOpen} />
            <StyledBox>
                <Box>
                    <Stack direction={"row"}>
                        <TextField
                            fullWidth
                            id="text-unit-content"
                            label="Wyszukaj tagi"
                            variant="outlined"
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Button
                            variant="outlined"
                            sx={{
                                px: 5,
                                mx: 2,
                            }}
                            onClick={onAddTextUnitQueue}
                        >
                            Dodaj
                        </Button>
                    </Stack>
                </Box>
                <Box>
                    {filteredTags.map((tag) => (
                        <Card
                            sx={{
                                borderRadius: 2,
                                p: {
                                    xs: 1,
                                    md: 2,
                                },
                                my: 2,
                            }}
                            key={tag.id}
                        >
                            <Stack
                                direction={"row"}
                                justifyContent={"space-between"}
                                alignItems={"center"}
                            >
                                <Typography
                                    variant={"h6"}
                                    textOverflow={"ellipsis"}
                                    noWrap
                                    sx={{
                                        fontSize: {
                                            xs: "0.85rem", // For xs breakpoints and below
                                            sm: "1.25rem", // For sm breakpoints and above
                                            // Add more breakpoints as needed
                                        },
                                    }}
                                >
                                    {tag.name}
                                </Typography>
                                <Stack flexWrap="nowrap" direction="row">
                                    {isXs ? (
                                        <>
                                            <IconButton
                                                onClick={(e) => {
                                                    setEditTagDialogOpen(true);
                                                    handleClickTextUnitMenu(e.currentTarget)
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                color="warning"
                                                onClick={() => onEditTextUnitQueue(tag.id)}
                                            >
                                                Edytuj
                                            </Button>
                                        </>
                                    )}
                                </Stack>
                            </Stack>
                        </Card>
                    ))}

                    <Menu
                        elevation={0}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleCloseTextUnitMenu}
                    >
                        <MenuItem
                            onClick={() => {
                                handleCloseTextUnitMenu();
                            }}
                        >
                            Edytuj
                        </MenuItem>
                    </Menu>
                </Box>
            </StyledBox>
        </>
    );
};

export interface DragAndDropItem {
    text: string;
    key: string;
}
