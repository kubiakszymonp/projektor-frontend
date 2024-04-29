import { useEffect, useRef, useState } from "react";
import {  getStaticResourceUrl } from "../../api"
import { GetProjectorStateDto } from "../../api/generated"

export const ProjectorMediaDisplay: React.FC<{ projectorState: GetProjectorStateDto }> = ({ projectorState }) => {

    const [imageStyles, setImageStyles] = useState({
        width: "100%",
        height: "100%",
    });
    const imageRef = useRef<HTMLImageElement>(null);


    useEffect(() => {
        if (!projectorState?.uploadedFile) return;
        const image = imageRef.current;
        if (!image) return;
        const { naturalWidth, naturalHeight } = image;
        const { screenWidth, screenHeight } = projectorState.settings;

        const screenRatio = screenWidth / screenHeight;
        const imageRatio = naturalWidth / naturalHeight;

        if (imageRatio <= screenRatio) {
            setImageStyles({
                width: `auto`,
                height: `100%`,
            });
        }
        if (imageRatio > screenRatio) {
            setImageStyles({
                width: `100%`,
                height: `auto`,
            });
        }
    }, [projectorState?.uploadedFile?.id, projectorState]);

    return (
        <img
            ref={imageRef}
            src={getStaticResourceUrl(projectorState?.uploadedFile?.previewUrl)}
            alt="media"
            style={{
                ...imageStyles,
                marginTop: "auto",
                marginBottom: "auto",
                marginLeft: "auto",
                marginRight: "auto",
            }}
        />
    )
}



