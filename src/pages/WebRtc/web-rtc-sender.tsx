import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Camera, Computer, Face, Forest, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum } from "../../api/generated";
import { displayStateApi, projectorApi, webRtcStreamApi } from "../../api";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";
import { CapturingStateType, useMediaCapture } from "../../services/user-media-capture.provider";
import { createPeerConnectionWithOffer } from "../../services/use-web-rtc-sender";

export const WebRtcStream: React.FC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);
    const [projectorState, setProjectorState] = useState<GetDisplayDto>();
    const [pc1, setPc1] = useState<RTCPeerConnection>();
    const { setCapturingType, stream } = useMediaCapture();

    useEffect(() => {
        return () => {
            setCapturingType(CapturingStateType.NONE);
        };
    }, []);

    const clear = async () => {
        await displayStateApi.displayStateControllerUpdateDisplayState({
            displayType: GetDisplayDtoDisplayTypeEnum.WebRtc,
            emptyDisplay: false
        });
        await webRtcStreamApi.webRtcControllerSetOffer({ payload: null as any });
        await webRtcStreamApi.webRtcControllerSetAnswer({ payload: null as any });
    };

    const onProjectorUpdate = async () => {
        console.log("onProjectorUpdate");
        const projectorState = await projectorApi.projectorControllerGetProjectorState();
        setProjectorState(projectorState.data);
    };

    useNotifyOnProjectorUpdate(onProjectorUpdate, String(organizationId));

    useEffect(() => {
        if (projectorState?.webRtcState?.offer && projectorState?.webRtcState?.answer) {
            acceptAnswer();
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
        const peerConnection = await createPeerConnectionWithOffer(stream);
        setPc1(peerConnection);
        await webRtcStreamApi.webRtcControllerSetOffer({ payload: peerConnection.localDescription! });
    };

    const startCapture = async () => {
        setCapturingType(CapturingStateType.BACK);
    };

    const stopCaptureAndStream = () => {
        localVideoRef.current!.srcObject = null;
        pc1?.close();
        setPc1(undefined);
    };

    const acceptAnswer = async () => {
        pc1?.setRemoteDescription(new RTCSessionDescription(projectorState!.webRtcState!.answer! as any));
    };

    return (
        <>
            <div style={{ display: "flex", height: "100vh", width: "100%", backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
                <video ref={localVideoRef} muted autoPlay></video>
            </div>
            <button onClick={() => { clear() }}>clear</button>
            <button onClick={() => { startCapture() }}>startCapture</button>
            <button onClick={() => { startStreamAndSendOffer() }}>startStreamAndSendOffer</button>
        </>
    );
};
