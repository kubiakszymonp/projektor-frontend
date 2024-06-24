import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { GetProjectorSettingsDto, ProjectorSettingsApi, TextStrategy } from "../../api/generated";
import StyledBox from "../../components/page-wrapper";
import { useApi } from "../../services/useApi";
import { NavBar } from "../../components/nav-bar";

interface FieldWithDescription {
  fieldName: string;
  description: string;
  name: string;
  options?: { key: string; value: string }[];
}

const TEXT_STRATEGY_INPUT: FieldWithDescription = {
  fieldName: "textStrategy",
  description: "",
  name: "Sposób generowania tekstu",
  options: [
    {
      key: TextStrategy.Automatic,
      value: "Automatyczny",
    },
    {
      key: TextStrategy.FixedLines,
      value: "Stała długość linii",
    },
    {
      key: TextStrategy.ExampleText,
      value: "Losowy tekst",
    },
  ],
};

const TEXT_SETTINGS: FieldWithDescription[] = [
  {
    fieldName: "linesOnPage",
    description: "",
    name: "Liczba linii na stronie",
  },
  {
    fieldName: "charactersInLine",
    description: "",
    name: "Liczba znaków w linii",
  },
];

const DISPLAY_SETTINGS: FieldWithDescription[] = [
  {
    fieldName: "backgroundColor",
    description:
      "Podaj nazwę koloru w języku angielskim lub w formacie #RRGGBB",
    name: "Kolor tła",
  },
  {
    fieldName: "fontColor",
    description:
      "Podaj nazwę koloru w języku angielskim lub w formacie #RRGGBB",
    name: "Kolor czcionki",
  },
  {
    fieldName: "fontSize",
    description: "",
    name: "Rozmiar czcionki",
  },
  {
    fieldName: "fontFamily",
    description: "",
    name: "Rodzina czcionki",
  },
  {
    fieldName: "letterSpacing",
    description: "",
    name: "Odstęp między literami",
  },
  {
    fieldName: "textAlign",
    description: "",
    name: "Wyrównanie tekstu",
  },
  {
    fieldName: "textAlign",
    description: "",
    name: "Wyrównanie tekstu",
  },
  {
    fieldName: "marginInline",
    description: "",
    name: "Margines w poziomie",
  },
  {
    fieldName: "marginBlock",
    description: "",
    name: "Margines w pionie",
  },
  {
    fieldName: "textVertically",
    description: "",
    name: "Wyrównanie tekstu pionowo",
  },
  {
    fieldName: "paddingTop",
    description: "",
    name: "Padding górny",
  },
  {
    fieldName: "lineHeight",
    description: "",
    name: "Wysokość linii",
  },
];

export const DisplaySettings = () => {
  const [projectorSettings, setProjectorSettings] =
    useState<GetProjectorSettingsDto>();
  const { getApi } = useApi();

  useEffect(() => {
    saveCurrentSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectorSettings]);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const saveCurrentSettings = async () => {
    if (!projectorSettings) return;
    await getApi(ProjectorSettingsApi).projectorSettingsControllerUpdate(
      projectorSettings
    );
  };

  const fetchCurrentSettings = async () => {
    const state =
      await getApi(ProjectorSettingsApi).projectorSettingsControllerGetSetting();
    setProjectorSettings(state.data);
  };

  return (
    <>
      <NavBar />
      <StyledBox>
        <Typography
          component="h3"
          variant="h4"
          sx={{
            marginBottom: 3,
          }}
        >
          Ustawienia
        </Typography>
        {projectorSettings && (
          <Stack direction={"column"}>
            <Typography variant="h5" sx={{ p: 2 }}>
              Ustawienia tekstu
            </Typography>
            {TEXT_SETTINGS.map((field, index) => (
              <TextField
                sx={{ mb: 2 }}
                key={index}
                id="outlined-basic"
                label={field.name}
                variant="outlined"
                value={(projectorSettings as any)[field.fieldName]}
                onChange={(e) => {
                  setProjectorSettings({
                    ...projectorSettings,
                    [field.fieldName]: e.target.value,
                  });
                }}
              />
            ))}
            <FormControl>
              <InputLabel id="demo-select-small-label">Tryb wyświetlania tekstu</InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={
                  (projectorSettings as any)[TEXT_STRATEGY_INPUT.fieldName]
                }
                label="Tryb wyświetlania tekstu"
                onChange={(e) => {
                  setProjectorSettings({
                    ...projectorSettings,
                    [TEXT_STRATEGY_INPUT.fieldName]: e.target.value,
                  });
                }}
              >
                {TEXT_STRATEGY_INPUT.options?.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="h5" sx={{ p: 2 }}>
              Ustawienia wizualne
            </Typography>
            {DISPLAY_SETTINGS.map((field, index) => (
              <TextField
                sx={{ mb: 2 }}
                key={index}
                id="outlined-basic"
                label={field.name}
                variant="outlined"
                value={(projectorSettings as any)[field.fieldName]}
                onChange={(e) => {
                  setProjectorSettings({
                    ...projectorSettings,
                    [field.fieldName]: e.target.value,
                  });
                }}
              />
            ))}
          </Stack>
        )}
      </StyledBox>
    </>
  );
};
