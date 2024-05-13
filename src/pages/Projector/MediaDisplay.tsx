import { useEffect, useRef, useState } from "react";
import { getStaticResourceUrl } from "../../api"
import { GetProjectorStateDto } from "../../api/generated"
import { useInterval } from "../../services/useInterval";

export const ProjectorMediaDisplay: React.FC<{ projectorState: GetProjectorStateDto }> = ({ projectorState }) => {

    const [imageStyles, setImageStyles] = useState({
        width: "100%",
        height: "100%",
    });
    const imageRef = useRef<HTMLImageElement>(null);
    useInterval(() => {
        resize();
    }, 200);

    const resize = () => {
        if (!projectorState?.uploadedFile) return;
        const image = imageRef.current;
        if (!image) return;
        const { naturalWidth, naturalHeight } = image;
        const { screenWidth, screenHeight } = projectorState.settings;

        const screenRatio = screenWidth / screenHeight;
        const imageRatio = naturalWidth / naturalHeight;

        let width = 0;
        let height = 0;

        if (imageRatio > screenRatio) {
            width = screenWidth;
            height = width / imageRatio;
        }
        // full vertical
        else {
            height = screenHeight;
            width = height * imageRatio;
        }

        setImageStyles({
            width: width + "px",
            height: height + "px",
        });
    };

    useEffect(() => {
        resize();
    }, [projectorState]);

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



