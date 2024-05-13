import { RefObject } from "react";
import { MovePageDtoDirectionEnum } from "../../api/generated";

export const OnPreviewClickHandler: React.FC<{
    previewRef: RefObject<HTMLDivElement>,
    movePage: (direction: MovePageDtoDirectionEnum) => void
}> = ({ previewRef, movePage }) => {

    const width = previewRef.current?.offsetWidth;
    const height = previewRef.current?.offsetHeight;
    const top = previewRef.current?.offsetTop;

    return (
        <div
            style={{
                top: top,
                display: "flex",
                width: width,
                position: "absolute",
                color: "red",
                zIndex: 50,
                height: height,
            }}
        >
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
        </div>)
};