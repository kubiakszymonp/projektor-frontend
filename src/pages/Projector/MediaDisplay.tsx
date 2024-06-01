import { useEffect, useMemo, useRef, useState } from "react";
import { getStaticResourceUrl } from "../../api"
import { useInterval } from "../../services/useInterval";
import { GetDisplayDto, GetProjectorSettingsDto } from "../../api/generated";

export const ProjectorMediaDisplay: React.FC<{ displayState: GetDisplayDto, projectorSettings: GetProjectorSettingsDto }> =
    ({ displayState, projectorSettings }) => {

        const [imageStyles, setImageStyles] = useState({
            width: "100%",
            height: "100%",
        });
        const imageRef = useRef<HTMLImageElement>(null);
        useInterval(() => {
            resize();
        }, 200);

        const mediaUrl = useMemo(() => {
            try {
                return getStaticResourceUrl(displayState?.mediaFile?.url);
            } catch (e) {
                return null;
            }
        }, [displayState?.mediaFile?.url]);

        const resize = () => {
            if (!displayState?.mediaFile) return;
            const image = imageRef.current;
            if (!image) return;
            const { naturalWidth, naturalHeight } = image;
            const { screenWidth, screenHeight } = projectorSettings;

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
        }, [displayState]);

        return (
            <>
                {mediaUrl && (<img
                    ref={imageRef}
                    src={mediaUrl}
                    alt="media"
                    style={{
                        ...imageStyles,
                        marginTop: "auto",
                        marginBottom: "auto",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }}
                />)}
            </>
        )
    }



