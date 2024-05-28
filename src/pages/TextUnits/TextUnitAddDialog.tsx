import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { textUnitApi } from "../../api";
import { useEffect, useState } from "react";
import { CustomPopover } from "../../components/popover";
import { CreateTextUnitDto } from "../../api/generated";
import { TextUnitInputs } from "./text-unit-inputs";

export const emptyTextUnitObject: CreateTextUnitDto = {
    content: "",
    displayQueueIds: [],
    textUnitTagIds: [],
    title: "",
    partsOrder: "",
};

const SONG_HELP_TEXT = `Tekst składa się z części oddzielonych nową linią. Każda z części może rozpoczynać się znacznikiem tytułowym wewnątrz kwadratowych nawiasów.\n
  \n
  Przykład:\n
  [Pierwsza zwrotka]\n
  Pan kiedyś stanął nad brzegiem,\n
  Szukał ludzi gotowych pójść za nim.\n
  ...\n
  \n
  [Refren]\n
  O Panie to Ty na mnie spojrzałeś,\n
  Twoje usta dziś wyrzekły me imię.\n
  ...
  `;

export const TextUnitAddDialog: React.FC<{
    open: boolean;
    handleClose: () => void;
}> = ({ open, handleClose }) => {
    const [textUnit, setTextUnit] =
        useState<CreateTextUnitDto>(emptyTextUnitObject);

    useEffect(() => {
        setTextUnit(emptyTextUnitObject);
    }, [open]);

    const onSave = async () => {
        await textUnitApi.textUnitControllerCreate(textUnit);
        handleClose();
    };

    return (
        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>
                Dodaj nowy tekst
            </DialogTitle>
            <DialogContent>
                {textUnit && (
                    <TextUnitInputs setTextUnit={setTextUnit} textUnit={textUnit} />
                )}
            </DialogContent>
            <DialogActions>
                <CustomPopover text={SONG_HELP_TEXT} />
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
