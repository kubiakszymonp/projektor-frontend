import axios from "axios";
import {
  AuthApi,
  DisplayStateApi,
  MediaFilesApi,
  OrganizationsApi,
  ProjectorApi,
  ProjectorSettingsApi,
  TextUnitQueuesApi,
  TextUnitsApi,
  TextUnitTagApi,
} from "./generated";
import { jwtPersistance } from "../services/jwt-persistance";
import { environment } from "../environment";

export const BASE_PATH = environment.BACKEND_HOST;

const UPLOAD_ROOT = BASE_PATH + "/upload/";

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
export const uploadedFilesApi = new MediaFilesApi(
  undefined,
  BASE_PATH,
  instance
);

export const textUnitTagApi = new TextUnitTagApi(
  undefined,
  BASE_PATH,
  instance
);

// export const liveStreamingApi = new LiveStreamingApi(
//   undefined,
//   BASE_PATH,
//   instance
// );

export const getStaticResourceUrl = (
  resourceOid: string | null | undefined
) => {
  if (!resourceOid) throw Error("File oid is empty");
  return UPLOAD_ROOT + resourceOid;
};
