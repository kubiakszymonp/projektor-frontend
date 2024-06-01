import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Camera, Computer, Face, Forest, NotInterested, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum, WebrtcStreamApi } from "../../api/generated";
import { displayStateApi, projectorApi, webRtcStreamApi } from "../../api";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";
import { CapturingStateType, useMediaCapture } from "../../services/user-media-capture.provider";
import { ConnectingState, acceptRtcAnswer, createPeerConnectionWithOffer, getWebRtcState } from "../../services/web-rtc-utils";

export const WebRtcStream: React.FC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);
    const [projectorState, setProjectorState] = useState<GetDisplayDto>();
    const [peerConnections, setPeerConnections] = useState<PeerConnectionWithScreenId[]>([]);
    const { setCapturingType, stream } = useMediaCapture();
    const [activeScreenIds, setActiveScreenIds] = useState<string[]>([]);

    useEffect(() => {
        clear();
        fetchScreenIds();
        return () => {
            hideDisplay();
            stopCapture();
            stopStream();
        };
    }, []);

    const clear = async () => {
        await webRtcStreamApi.webRtcControllerClearOrganization();
    }

    const fetchScreenIds = async () => {
        const res = await webRtcStreamApi.webRtcControllerGetState();
        const screenIds = res.data.map(s => s.screenId);
        setActiveScreenIds(screenIds);
    };


    const hideDisplay = async () => {
        await displayStateApi.displayStateControllerUpdateDisplayState({
            emptyDisplay: true
        });
    }

    const onProjectorUpdate = async () => {
        const projectorState = await projectorApi.projectorControllerGetProjectorState();
        setProjectorState(projectorState.data);
    };

    useNotifyOnProjectorUpdate(onProjectorUpdate, { organizationId });

    useEffect(() => {
        projectorState?.webRtcState?.forEach(state => {
            if (getWebRtcState(state) === ConnectingState.ANSWER_READY) {
                const peerConnection = peerConnections.find(pc => pc.screenId === state.screenId)?.peerConnection;
                if (peerConnection && state.answer) {
                    acceptRtcAnswer(peerConnection, state.answer as any);
                }
            }
        });
    }, [projectorState]);

    useEffect(() => {
        if (stream) {
            const video = localVideoRef.current!;
            video.srcObject = stream;
        }
    }, [stream]);

    const startStreamAndSendOffer = async () => {
        if (!stream) return;
        await displayStateApi.displayStateControllerUpdateDisplayState({
            displayType: GetDisplayDtoDisplayTypeEnum.WebRtc,
            emptyDisplay: false
        });

        const peerConnections = activeScreenIds.map(async screenId => {
            const pc = await createPeerConnectionWithOffer(stream);
            await webRtcStreamApi.webRtcControllerSetOffer({ payload: pc.localDescription!, screenId });
            return {
                peerConnection: pc,
                screenId
            };
        });

        setPeerConnections(await Promise.all(peerConnections));
    };

    const startCapture = async (captureType: CapturingStateType) => {
        setCapturingType(captureType);
    };

    const stopStream = async () => {
        peerConnections?.forEach(pc => pc.peerConnection.close());
        setPeerConnections([]);
        await hideDisplay();
    }

    const stopCapture = () => {
        setCapturingType(CapturingStateType.NONE);
        if (localVideoRef?.current) localVideoRef.current.srcObject = null;
        stopStream();
    };

    return (
        <>
            <div style={{ display: "flex", height: "100vh", width: "100%", backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
                <div
                    style={{
                        position: "absolute",
                        top: "5%",
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
                        <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            color="warning"
                            onClick={() => stopStream()}
                        >
                            <Stop fontSize="large" />
                        </Button>
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