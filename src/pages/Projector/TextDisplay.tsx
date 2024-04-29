import React from "react";
import { GetProjectorStateDto, TextStrategy } from "../../api/generated";
import { Property } from "csstype";
import { AutoFlowText } from "../../components/auto-flow-text";

export const ProjectorTextDisplay: React.FC<{ projectorState: GetProjectorStateDto }> = ({ projectorState }) => {


    return (
        <>
            {projectorState.settings.textStrategy !== TextStrategy.Automatic && (
                <div
                    style={{
                        paddingTop: projectorState?.settings.paddingTop,
                        justifyContent: projectorState?.settings.textVertically,
                        height: "100%",
                        width: "100%",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {projectorState?.lines.map((line, index) => {
                        return (
                            <div
                                key={index}
                                className="text-line"
                                style={{
                                    color: projectorState?.settings.fontColor,
                                    fontFamily: projectorState?.settings.fontFamily,
                                    fontSize: projectorState?.settings.fontSize,
                                    textAlign: projectorState?.settings
                                        .textAlign as Property.TextAlign,
                                    letterSpacing: projectorState?.settings.letterSpacing,
                                    lineHeight: projectorState?.settings.fontSize,
                                    marginInline: projectorState?.settings.marginInline,
                                    marginBlock: projectorState?.settings.marginBlock,
                                }}
                            >
                                {line}
                            </div>
                        );
                    })}
                </div>
            )}
            {projectorState.settings.textStrategy === TextStrategy.Automatic && (
                <AutoFlowText
                    settings={projectorState?.settings}
                    text={projectorState.lines.join("\n")}
                />
            )}
        </>
    )
}