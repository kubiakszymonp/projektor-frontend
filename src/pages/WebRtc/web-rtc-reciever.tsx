import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Computer, Face, Forest, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum } from "../../api/generated";
import { displayStateApi, projectorApi, webRtcStreamApi } from "../../api";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";
import { ConnectingState, createPeerConnectionWithAnswer, getWebRtcState, onTrackEventAsVideoSource } from "../../services/web-rtc-utils";

export const WebRtcStreamReciever: React.FC<{ screenId: string, projectorState: GetDisplayDto }> = ({ screenId, projectorState }) => {
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();

    useEffect(() => {
        return () => {
            peerConnection?.close();
        };
    }, []);

    useEffect(() => {
        const screenWebRtcState = projectorState?.webRtcState?.find(s => s.screenId === screenId);
        if (getWebRtcState(screenWebRtcState) === ConnectingState.OFFER_READY) {
            acceptOfferAndSendAnswer();
        }
    }, [projectorState]);

    const acceptOfferAndSendAnswer = async () => {
        const screenWebRtcState = projectorState?.webRtcState?.find(s => s.screenId === screenId);
        const pc = await createPeerConnectionWithAnswer(screenWebRtcState!.offer! as any, async (event) => {
            onTrackEventAsVideoSource(event, remoteVideoRef);
        });

        setPeerConnection(pc);
        await webRtcStreamApi.webRtcControllerSetAnswer({ payload: pc.localDescription!, screenId });
    }

    return (
        <>
            <div style={{ display: "flex", height: "100vh", width: "100%", backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
                <div style={{
                    position: "relative",
                    width: " 100%",
                    height: "100%",
                    overflow: "hidden"
                }}>
                    <video ref={remoteVideoRef} muted autoPlay style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transform: "translate(-50%, -50%)"

                    }}></video>
                </div>
            </div>
        </>
    );
};
