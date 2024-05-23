import React from "react";
import { GetDisplayDto, GetProjectorSettingsDto, TextStrategy } from "../../api/generated";
import { Property } from "csstype";
import { AutoFlowText } from "../../components/auto-flow-text";

export const ProjectorTextDisplay: React.FC<{ displayState: GetDisplayDto, projectorSettings: GetProjectorSettingsDto }> =
    ({ displayState, projectorSettings }) => {


        return (
            <>
                {projectorSettings?.textStrategy !== TextStrategy.Automatic && (
                    <div
                        style={{
                            paddingTop: projectorSettings?.paddingTop,
                            justifyContent: projectorSettings?.textVertically,
                            height: "100%",
                            width: "100%",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {(displayState?.lines || []).map((line, index) => {
                            return (
                                <div
                                    key={index}
                                    className="text-line"
                                    style={{
                                        color: projectorSettings?.fontColor,
                                        fontFamily: projectorSettings?.fontFamily,
                                        fontSize: projectorSettings?.fontSize,
                                        textAlign: projectorSettings?.textAlign as Property.TextAlign,
                                        letterSpacing: projectorSettings?.letterSpacing,
                                        lineHeight: projectorSettings?.fontSize,
                                        marginInline: projectorSettings?.marginInline,
                                        marginBlock: projectorSettings?.marginBlock,
                                    }}
                                >
                                    {line}
                                </div>
                            );
                        })}
                    </div>
                )}
                {projectorSettings?.textStrategy === TextStrategy.Automatic && (
                    <AutoFlowText
                        settings={projectorSettings}
                        text={(displayState?.lines || []).join("\n")}
                    />
                )}
            </>
        )
    }