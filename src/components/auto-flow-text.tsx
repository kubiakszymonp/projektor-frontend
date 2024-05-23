import { useEffect, useRef, useState } from "react";
import { Property } from "csstype";
import { GetProjectorSettingsDto } from "../api/generated";
export const AutoFlowText: React.FC<{
  text: string;
  settings: GetProjectorSettingsDto;
}> = ({ text, settings }) => {
  const [calculationsFontSize, setCalculationsFontSize] = useState(250);
  const [fontSize, setFontSize] = useState(250);
  const [visible, setVisible] = useState(false);
  const [recentlyUsedDecrement, setRecentlyUsedDecrement] = useState(250);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setCalculationsFontSize(250);
    setRecentlyUsedDecrement(250);
    setVisible(false);
  }, [
    text,
    settings.lineHeight,
    settings.fontFamily,
    settings.marginBlock,
    settings.marginInline,
    settings.letterSpacing,
    settings.textAlign,
    settings.fontColor,
    settings.screenWidth,
    settings.screenHeight,
  ]);

  useEffect(() => {
    if (textRef.current === null) return;

    const clientHeight = window.innerHeight;
    const textHeight = textRef.current.clientHeight;

    const factor = 0.01;
    const errorValue = textHeight - clientHeight;
    const decreaseFactor = Math.max(errorValue * factor, 1);

    if (textHeight > clientHeight) {
      setCalculationsFontSize(calculationsFontSize - decreaseFactor);
    } else {
      setFontSize(calculationsFontSize);
      setVisible(true);
    }
  }, [calculationsFontSize]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {visible && (
        <p
          style={{
            color: settings.fontColor,
            fontFamily: settings.fontFamily,
            letterSpacing: settings.letterSpacing,
            lineHeight: settings.lineHeight,
            fontSize: `${fontSize}px`,
            textAlign: settings.textAlign as Property.TextAlign,
            padding: "0",
            margin: "0",
            position: "fixed",
            paddingBlock: settings.marginBlock,
            paddingInline: settings.marginInline,
            overflow: "hidden",
          }}
          dangerouslySetInnerHTML={{
            __html: text.replaceAll("\n", "<br/>"),
          }}
        ></p>
      )}

      <p
        ref={textRef}
        style={{
          color: settings.fontColor,
          fontFamily: settings.fontFamily,
          letterSpacing: settings.letterSpacing,
          lineHeight: settings.lineHeight,
          fontSize: `${calculationsFontSize}px`,
          textAlign: settings.textAlign as Property.TextAlign,
          padding: "0",
          margin: "0",
          position: "fixed",
          visibility: "hidden",
          paddingBlock: settings.marginBlock,
          paddingInline: settings.marginInline,
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: text.replaceAll("\n", "<br/>") }}
      ></p>
    </div>
  );
};
