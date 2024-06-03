import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Computer, Face, Forest, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum } from "../../api/generated";
import { displayStateApi, projectorApi, webRtcStreamApi } from "../../api";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";
import { ConnectingState, createPeerConnectionWithAnswer, getWebRtcState, onTrackEventAsVideoSource } from "../../services/web-rtc-utils";
import { Socket, io } from "socket.io-client";
import { environment } from "../../environment";

export const WebRtcStreamReciever: React.FC<{ screenId: string, projectorState: GetDisplayDto }> = ({ screenId, projectorState }) => {
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
    const [isConnected, setIsConnected] = useState(false);
    const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);
    const [socket, setSocket] = useState<Socket | null>(null);


    useEffect(() => {
        const socket = io(environment.BACKEND_HOST, {
            secure: true,
            query: { organizationId, role: "RECIEVER" },
            transports: ["websocket"]
        });

        socket.on("offer", async (answer: RTCSessionDescriptionInit) => {
            console.log(`[WebRtcSender] received offer`);
            if (remoteVideoRef?.current?.srcObject) {
                remoteVideoRef.current.srcObject = null;
            }

            const pc = await createPeerConnectionWithAnswer(answer, async (event) => {
                onTrackEventAsVideoSource(event, remoteVideoRef);
            });
            setPeerConnection(pc);
            pc.onconnectionstatechange = () => {
                setIsConnected(pc.connectionState === "connected");
            };

            socket.emit("answer", pc.localDescription);
        });

        setSocket(socket);

        return () => {
            peerConnection?.close();
        };
    }, []);

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
                        transform: "translate(-50%, -50%)",
                    }}></video>
                </div>
            </div>
        </>
    );
};
