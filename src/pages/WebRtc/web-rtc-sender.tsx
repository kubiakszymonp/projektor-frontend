import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Camera, Computer, Face, Forest, NotInterested, PlayArrow, Stop } from "@mui/icons-material";
import { DisplayStateApi, GetDisplayDto, GetDisplayDtoDisplayTypeEnum, WebrtcStreamApi } from "../../api/generated";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";
import { CapturingStateType, useMediaCapture } from "../../services/user-media-capture.provider";
import { ConnectingState, acceptRtcAnswer, createPeerConnectionWithOffer, getWebRtcState } from "../../services/web-rtc-utils";
import { environment } from "../../environment";
import { Socket, io } from "socket.io-client";
import { useApi } from "../../services/useApi";
import { NavBar } from "../../components/nav-bar";

export const WebRtcStream: React.FC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);
    const [peerConnections, setPeerConnections] = useState<PeerConnectionWithScreenId[]>([]);
    const { setCapturingType, stream } = useMediaCapture();
    const [pendingAnswers, setPendingAnswers] = useState<{ screenId: string, answer: RTCSessionDescriptionInit }[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { getApi } = useApi();

    useEffect(() => {
        const socket = io(environment.BACKEND_HOST, {
            secure: true,
            query: { organizationId, role: "SENDER" },
            transports: ["websocket"]
        });

        socket.on("answer", (data: { clientId: string, answer: RTCSessionDescriptionInit }) => {
            console.log(`[WebRtcSender] received answer from ${data.clientId}`);
            setPendingAnswers(prevPendingAnswers => [...prevPendingAnswers, { screenId: data.clientId, answer: data.answer }]);
        });

        setSocket(socket);


        return () => {
            hideDisplay();
            stopCapture();
            stopStream();
            clear();
        };
    }, []);


    useEffect(() => {
        if (pendingAnswers.length > 0) {
            pendingAnswers.forEach(async answer => {
                const peerConnection = peerConnections.find(pc => pc.screenId === answer.screenId)?.peerConnection;
                const signalingState = peerConnection?.signalingState;
                if (peerConnection && signalingState !== "closed" && signalingState !== "stable") {
                    await acceptRtcAnswer(peerConnection, answer.answer);
                }
            });
            setPendingAnswers(pendingAnswers => pendingAnswers.slice(1));
        }

        if (pendingAnswers.length === 0) {
            getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
                emptyDisplay: false
            });
        }

    }, [pendingAnswers]);

    const clear = async () => {
        await getApi(WebrtcStreamApi).webRtcControllerClearOrganization();
    }

    const hideDisplay = async () => {
        await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
            emptyDisplay: true
        });
    }

    useEffect(() => {
        if (stream) {
            const video = localVideoRef.current!;
            video.srcObject = stream;
        }
    }, [stream]);

    const getState = async () => {
        return new Promise<ConnectedClient[]>((resolve, reject) => {
            socket?.emit('get-state');

            socket?.once('get-state', (data) => {
                resolve(data);
            });

            setTimeout(() => {
                reject(new Error('Timeout while waiting for get-state response'));
            }, 5000); // Adjust timeout as necessary
        });
    }

    const startStreamAndSendOffer = async () => {
        if (!stream) return;


        await getApi(DisplayStateApi).displayStateControllerUpdateDisplayState({
            displayType: GetDisplayDtoDisplayTypeEnum.WebRtc,
            emptyDisplay: true
        });

        const connectedClients = await getState();
        console.log("connectedClients: ", connectedClients);

        const pcs = connectedClients.map(async client => {
            const pc = await createPeerConnectionWithOffer(stream);

            console.log(`[WebRtcSender] sending offer for screen: ${client.clientId}`)
            socket?.emit('offer', { clientId: client.clientId, offer: pc.localDescription! });

            return { peerConnection: pc, screenId: client.clientId };
        });

        setPeerConnections(await Promise.all(pcs));
    };

    const startCapture = async (captureType: CapturingStateType) => {
        setCapturingType(captureType);
    };

    const stopStream = async () => {
        peerConnections?.forEach(pc => pc.peerConnection.close());
        setPeerConnections([]);
        await clear();
        await hideDisplay();
    }

    const stopCapture = () => {
        setCapturingType(CapturingStateType.NONE);
        if (localVideoRef?.current) localVideoRef.current.srcObject = null;
        stopStream();
    };

    return (
        <>
            <NavBar />
            <div style={{
                display: "flex",
                height: "100vh", width: "100%",
                backgroundColor: "black", justifyContent: "center",
                alignItems: "center",
                position: "relative"
            }}>
                <div
                    style={{
                        position: "absolute",
                        top: "1rem",
                        zIndex: 5,
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                    }}
                >
                    {!stream && (
                        <>
                            <Button
                                sx={{ m: 1 }}
                                variant="contained"
                                color="primary"
                                onClick={() => startCapture(CapturingStateType.FRONT)}
                            >
                                <Face />
                            </Button>
                            <Button
                                sx={{ m: 1 }}
                                variant="contained"
                                color="primary"
                                onClick={() => startCapture(CapturingStateType.BACK)}
                            >
                                <Forest />
                            </Button>
                            <Button
                                sx={{ m: 1 }}
                                variant="contained"
                                color="primary"
                                onClick={() => startCapture(CapturingStateType.SCREEN)}
                            >
                                <Computer />
                            </Button>
                        </>
                    )}

                    {stream && (
                        <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            color="error"
                            onClick={() => startCapture(CapturingStateType.NONE)}
                        >
                            <NotInterested />
                        </Button>
                    )}
                </div>
                <div
                    style={{
                        position: "absolute",
                        zIndex: 5,
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                        bottom: "5%",
                    }}
                >
                    {peerConnections?.length === 0 && (
                        <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            size="large"
                            color="success"
                            onClick={() => startStreamAndSendOffer()}
                        >
                            <PlayArrow fontSize="large" />
                        </Button>
                    )}
                    {peerConnections?.length > 0 && (
                        <>
                            <Button
                                sx={{ m: 1 }}
                                variant="contained"
                                color="warning"
                                onClick={() => stopStream()}
                            >
                                <Stop fontSize="large" />
                            </Button>
                        </>
                    )}
                </div>
                <div style={{
                    position: "relative",
                    width: " 100%",
                    height: "100%",
                    overflow: "hidden"
                }}></div>
                <video ref={localVideoRef} muted autoPlay style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transform: "translate(-50%, -50%)"

                }}></video>
            </div>
        </>
    );
};

export interface PeerConnectionWithScreenId {
    peerConnection: RTCPeerConnection;
    screenId: string;
}

export interface ConnectedClient {
    clientId: string;
    organizationId: string;
    role: string;
}