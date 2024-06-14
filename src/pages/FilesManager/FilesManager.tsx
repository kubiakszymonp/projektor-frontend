import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { MoreVert } from "@mui/icons-material";
import { FilePreviewModal } from "./FilePreviewModal";
import { DisplayStateApi, GetMediaFileDto, MediaFilesApi } from "../../api/generated";
import { uploadFilesToBackend } from "../../util/upload-files";
import StyledBox from "../../components/page-wrapper";
import { useApi } from "../../services/useApi";

export const FilesManager: React.FC = () => {
  const [fileInfosGrouped, setFileInfosGrouped] = useState<
    {
      date: Date;
      files: GetMediaFileDto[];
    }[]
  >([]);
  const [fileInfos, setFileInfos] = useState<GetMediaFileDto[]>([]);
  const [menuOpenedForFile, setMenuOpenedForFile] = useState<GetMediaFileDto>();
  const [filePreviewModalOpen, setFilePreviewModalOpen] = useState(false);
  const [currentPreviewFile, setCurrentPreviewFile] =
    useState<GetMediaFileDto | null>(null);

  useEffect(() => {
    loadData();
  }, []);
  const [
    currentProjectorDisplayedImageId,
    setCurrentProjectorDisplayedImageId,
  ] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getApi, getStaticResourceUrl } = useApi();

  const handleClickFileMenu = (el: HTMLElement) => {
    setAnchorEl(el);
  };

  const handleCloseFileMenu = () => {
    setAnchorEl(null);
  };

  const loadData = async () => {
    fetchFileInfos();
    fetchCurrentProjectorDisplayedImageId();
  };

  const fetchFileInfos = async () => {
    const filesInfo =
      await getApi(MediaFilesApi).mediaFilesControllerGetFilesForOrganization();
    setFileInfos(filesInfo.data);
    setFileInfosGrouped(groupFilesByDate(filesInfo.data));
  };

  const fetchCurrentProjectorDisplayedImageId = async () => {
    const displayState =
      await getApi(DisplayStateApi).displayStateControllerGetDisplayState();
    setCurrentProjectorDisplayedImageId(displayState.data.mediaFileId);
  };

  const groupFilesByDate = (fileInfos: GetMediaFileDto[]) => {
    const groupedFiles: { [key: string]: GetMediaFileDto[] } = {};
    fileInfos.forEach((fileInfo) => {
      const date = new Date(fileInfo.createdAt || new Date());
      const dayStartMillis = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ).getTime();
      if (groupedFiles[dayStartMillis]) {
        groupedFiles[dayStartMillis].push(fileInfo);
      } else {
        groupedFiles[dayStartMillis] = [fileInfo];
      }
    });

    const transformed = Object.keys(groupedFiles).map((key) => {
      return {
        date: new Date(parseInt(key)),
        files: groupedFiles[key],
      };
    });

    return transformed;
  };

  const handleUpload = async () => {
    if (!inputRef.current) return;
    await uploadFilesToBackend(inputRef.current.files!,
      (progress) => { console.log(`Progress: ${progress}`) },
      getApi(MediaFilesApi).mediaFilesControllerUploadMultipleFiles);
    loadData();
  };

  const deleteFile = async () => {
    await getApi(MediaFilesApi).mediaFilesControllerRemove(
      String(menuOpenedForFile?.id)
    );
    loadData();
  };

  const setAsCurrentCastingFile = async () => {
    await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
      mediaFileId: menuOpenedForFile?.id,
    });
    loadData();
  };

  const moveToPreviousFile = () => {
    const currentIndex = fileInfos.findIndex(
      (fileInfo) => fileInfo.id === currentPreviewFile?.id
    );
    if (currentIndex !== 0) {
      setCurrentPreviewFile(fileInfos[currentIndex - 1]);
    }
  };

  const moveToNextFile = () => {
    const currentIndex = fileInfos.findIndex(
      (fileInfo) => fileInfo.id === currentPreviewFile?.id
    );
    if (currentIndex !== fileInfos.length - 1) {
      setCurrentPreviewFile(fileInfos[currentIndex + 1]);
    }
  };

  return (
    <StyledBox>
      <FilePreviewModal
        open={filePreviewModalOpen}
        currentFile={currentPreviewFile}
        nextFile={moveToNextFile}
        previousFile={moveToPreviousFile}
        handleClose={() => {
          setFilePreviewModalOpen(false);
        }}
        refresh={loadData}
      />
      <input
        type="file"
        multiple
        hidden
        ref={inputRef}
        onChange={() => {
          handleUpload();
        }}
      />
      <Button
        variant="outlined"
        sx={{
          px: 5,
          mx: 2,
        }}
        onClick={() => {
          inputRef?.current?.click();
        }}
      >
        Prześlij jeden lub więcej plików
      </Button>

      {fileInfosGrouped.map((dateGroup) => (
        <Box
          key={dateGroup.date.toString()}
          sx={{
            p: 1,
          }}
        >
          <Typography variant={"h5"} sx={{ m: 1 }}>
            {dateGroup.date.toDateString()}
          </Typography>
          <Grid container spacing={1}>
            {dateGroup.files.map((fileInfo) => (
              <Grid item xs={6} sm={4} md={3} key={fileInfo.id}>
                <Card
                  sx={{
                    p: 1,
                  }}
                >
                  <Stack direction={"row"} justifyContent={"end"}>
                    {currentProjectorDisplayedImageId === fileInfo.id && (
                      <Badge
                        classes={{
                          anchorOriginTopRightRectangular: "noTransform",
                        }}
                        color="secondary"
                        badgeContent={"Wyświetlane"}
                      ></Badge>
                    )}
                  </Stack>
                  <Box
                    sx={{
                      maxHeight: {
                        xs: "150px",
                        sm: "250px",
                        md: "300px",
                      },
                      height: {
                        xs: "150px",
                        sm: "250px",
                        md: "300px",
                      },
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => {
                      setCurrentPreviewFile(fileInfo);
                      setFilePreviewModalOpen(true);
                    }}
                  >
                    <img
                      src={getStaticResourceUrl(fileInfo.url)}
                      alt={fileInfo.name}
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </Box>
                  <Stack
                    sx={{
                      maxWidth: "100%",
                    }}
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                  >
                    <Typography
                      onClick={() => {
                        setCurrentPreviewFile(fileInfo);
                        setFilePreviewModalOpen(true);
                      }}
                      sx={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fileInfo.name}
                    </Typography>

                    <IconButton
                      onClick={(e) => {
                        handleClickFileMenu(e.currentTarget);
                        setMenuOpenedForFile(fileInfo);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseFileMenu}
          >
            <MenuItem
              onClick={() => {
                setAsCurrentCastingFile();
                handleCloseFileMenu();
              }}
            >
              Rzutuj
            </MenuItem>
            <MenuItem
              onClick={() => {
                deleteFile();
                handleCloseFileMenu();
              }}
            >
              Usuń
            </MenuItem>
          </Menu>
        </Box>
      ))}
    </StyledBox>
  );
};
