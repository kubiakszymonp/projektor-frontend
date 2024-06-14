import React, { useEffect, useMemo, useRef, useState } from "react";
import { GetDisplayDto } from "../../api/generated";
import { jwtPersistance } from "../../services/jwt-persistance";
import { createPeerConnectionWithAnswer, onTrackEventAsVideoSource } from "../../services/web-rtc-utils";
import { io } from "socket.io-client";
import { environment } from "../../environment";

export const WebRtcStreamReciever: React.FC<{ screenId: string, projectorState: GetDisplayDto }> = ({ screenId, projectorState }) => {
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
    const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);


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

            socket.emit("answer", pc.localDescription);
        });

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
