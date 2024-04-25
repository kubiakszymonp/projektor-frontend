import axios from "axios";
import {
  AuthApi,
  DisplayStateApi,
  OrganizationsApi,
  ProjectorApi,
  ProjectorSettingsApi,
  TextUnitQueuesApi,
  TextUnitsApi,
  TextUnitTagApi,
  UploadedFilesApi,
} from "./generated";
import { jwtPersistance } from "../services/jwt-persistance";

export const CURRENT_HOST =
  window.location.protocol + "//" + window.location.hostname;
export const BASE_PATH = CURRENT_HOST + ":3001";
export const UPLOAD_ROOT = BASE_PATH + "/upload/";

export const createAxios = () => {
  const interceptedAxios = axios.create();
  interceptedAxios.interceptors.request.use((config) => {
    config.headers["Authorization"] = "Bearer " + jwtPersistance.getJwt();
    return config;
  });
  return interceptedAxios;
};

const instance = createAxios();

export const authApi = new AuthApi(undefined, BASE_PATH, instance);
export const displayStateApi = new DisplayStateApi(
  undefined,
  BASE_PATH,
  instance
);
export const organizationApi = new OrganizationsApi(
  undefined,
  BASE_PATH,
  instance
);
export const textUnitApi = new TextUnitsApi(undefined, BASE_PATH, instance);
export const textUnitQueuesApi = new TextUnitQueuesApi(
  undefined,
  BASE_PATH,
  instance
);
export const projectorSettingsApi = new ProjectorSettingsApi(
  undefined,
  BASE_PATH,
  instance
);
export const projectorApi = new ProjectorApi(undefined, BASE_PATH, instance);
export const uploadedFilesApi = new UploadedFilesApi(
  undefined,
  BASE_PATH,
  instance
);

export const textUnitTagApi = new TextUnitTagApi(
  undefined,
  BASE_PATH,
  instance
);
