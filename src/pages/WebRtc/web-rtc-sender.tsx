import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Camera, Computer, Face, Forest, NotInterested, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum } from "../../api/generated";
import { displayStateApi, projectorApi, webRtcStreamApi } from "../../api";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";
import { CapturingStateType, useMediaCapture } from "../../services/user-media-capture.provider";
import { ConnectingState, acceptRtcAnswer, createPeerConnectionWithOffer, getWebRtcState } from "../../services/web-rtc-utils";

export const WebRtcStream: React.FC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);
    const [projectorState, setProjectorState] = useState<GetDisplayDto>();
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
    const { setCapturingType, stream } = useMediaCapture();

    useEffect(() => {
        clear();
        return () => {
            hideDisplay();
            stopCapture();
            stopStream();
            clear();
        };
    }, []);

    const clear = async () => {
        await webRtcStreamApi.webRtcControllerSetOffer({ payload: null as any });
        await webRtcStreamApi.webRtcControllerSetAnswer({ payload: null as any });
    };

    const hideDisplay = async () => {
        await displayStateApi.displayStateControllerUpdateDisplayState({
            emptyDisplay: true
        });
    }

    const onProjectorUpdate = async () => {
        console.log("onProjectorUpdate");
        const projectorState = await projectorApi.projectorControllerGetProjectorState();
        setProjectorState(projectorState.data);
    };

    useNotifyOnProjectorUpdate(onProjectorUpdate, String(organizationId));

    useEffect(() => {
        if (getWebRtcState(projectorState?.webRtcState) === ConnectingState.ANSWER_READY) {
            acceptRtcAnswer(peerConnection!, projectorState?.webRtcState?.answer! as any);
        }
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
        const p = await createPeerConnectionWithOffer(stream);
        setPeerConnection(p);
        await webRtcStreamApi.webRtcControllerSetOffer({ payload: p.localDescription! });
    };

    const startCapture = async (captureType: CapturingStateType) => {
        setCapturingType(captureType);
    };

    const stopStream = async () => {
        peerConnection?.close();
        setPeerConnection(undefined);
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
                    {
                        stream && (
                            <Button
                                sx={{ m: 1 }}
                                variant="contained"
                                color="error"
                                onClick={() => startCapture(CapturingStateType.NONE)}
                            >
                                <NotInterested />
                            </Button>
                        )
                    }
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
                    {!peerConnection && (
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
                    {peerConnection && (
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