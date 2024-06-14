import { RefObject, useEffect, useState } from "react";
import { MovePageDtoDirectionEnum } from "../../api/generated";
import { useIntervalTick } from "../../util/interval-tick";

export const OnPreviewClickHandler: React.FC<{
    previewRef: RefObject<HTMLDivElement>,
    movePage: (direction: MovePageDtoDirectionEnum) => void
}> = ({ previewRef, movePage }) => {

    const tick = useIntervalTick(600);
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        const updatePosition = () => {
            if (previewRef.current) {
                const rect = previewRef.current.getBoundingClientRect();
                setStyle({
                    left: rect.left,
                    top: rect.top - window.scrollY,
                    width: rect.width,
                    height: rect.height,
                    position: "fixed",
                    color: "red",
                    zIndex: 50,
                    display: "flex",
                });
            }
        };

        updatePosition();
        window.addEventListener("scroll", updatePosition);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition);
            window.removeEventListener("resize", updatePosition);
        };
    }, [previewRef, tick]);

    return (
        <div style={style}>
            <div
                style={{ flex: 1 }}
                onClick={() => {
                    movePage(MovePageDtoDirectionEnum.Previous);
                }}
            ></div>
            <div
                style={{ flex: 1 }}
                onClick={() => {
                    movePage(MovePageDtoDirectionEnum.Next);
                }}
            ></div>
        </div>
    );
};
