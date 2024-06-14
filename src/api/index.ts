import { environment } from "../environment";

export const BASE_PATH = environment.BACKEND_HOST;

const UPLOAD_ROOT = BASE_PATH + "/upload/";

export const getStaticResourceUrl = (
  resourceOid: string | null | undefined
) => {
  if (!resourceOid) throw Error("File oid is empty");
  return UPLOAD_ROOT + resourceOid;
};
