import { uploadedFilesApi } from "../api";

export const uploadFilesToBackend = async (files: FileList, onUploadProgress: (progressPercentage: number) => void) => {
    const formData = new FormData();
    // append the files to the FormData object
    for (let i = 0; i < files!.length; i++) {
        formData.append("files", files![i]);
    }
    await uploadedFilesApi.mediaFilesControllerUploadMultipleFiles({
        data: formData,
        onUploadProgress: (progressEvent) => {
            onUploadProgress(Math.round((progressEvent.loaded / progressEvent.total!) * 100));
        }
    });
}