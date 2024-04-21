import { ForwardedRef, forwardRef } from "react";
import { scaleAndTranslate } from "../services/scale-and-translate";

export const AutoscalingIframe = forwardRef(
  (
    props: {
      originalWidth: number;
      originalHeight: number;
      desiredWidth: number;
      desiredHeight: number;
      url: string;
      onLoad?: () => void;
    },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const calculatedScaling = scaleAndTranslate(
      props.originalWidth,
      props.originalHeight,
      props.desiredWidth
    );

    return (
      <div
        ref={ref}
        className="container"
        style={{
          width: props.desiredWidth + "px",
          height: calculatedScaling.scaleFactor * props.originalHeight + "px",
        }}
      >
        <iframe
          onLoad={props.onLoad}
          src={props.url}
          title="Frame"
          style={{
            border: "none",
            width: props.originalWidth + "px",
            height: props.originalHeight + "px",
            transform: `translate(${calculatedScaling.translationX}px, ${calculatedScaling.translationY}px) scale(${calculatedScaling.scaleFactor})`,
          }}
        ></iframe>
      </div>
    );
  }
);
