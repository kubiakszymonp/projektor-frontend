import { AxiosResponse, RawAxiosRequestConfig } from "axios";

export const uploadFilesToBackend = async (files: FileList, onUploadProgress: (progressPercentage: number) => void, requestFunc: (options: RawAxiosRequestConfig | undefined) => Promise<AxiosResponse>) => {
const formData = new FormData();
    // append the files to the FormData object
    for (let i = 0; i < files!.length; i++) {
        formData.append("files", files![i]);
    }

    await requestFunc({
        data: formData,
        onUploadProgress: (progressEvent) => {
            onUploadProgress(Math.round((progressEvent.loaded / progressEvent.total!) * 100));
        }
    });
}