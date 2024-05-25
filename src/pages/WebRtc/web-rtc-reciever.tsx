import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Computer, Face, Forest, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum } from "../../api/generated";
import { displayStateApi, projectorApi, webRtcStreamApi } from "../../api";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";
import { createPeerConnectionWithAnswer } from "../../services/use-web-rtc-sender";

export const WebRtcStreamReciever2: React.FC = () => {
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);
    const [projectorState, setProjectorState] = useState<GetDisplayDto>();
    const [pc2, setPc2] = useState<RTCPeerConnection>();

    const onProjectorUpdate = async () => {
        console.log("onProjectorUpdate");
        const projectorState = await projectorApi.projectorControllerGetProjectorState();
        setProjectorState(projectorState.data);
    };

    useNotifyOnProjectorUpdate(onProjectorUpdate, String(organizationId));

    useEffect(() => {
        if (projectorState?.webRtcState?.offer && !projectorState?.webRtcState?.answer) {
            console.log("Offer sent, answer null");
            acceptOfferAndSendAnswer();
        }
    }, [projectorState]);

    const acceptOfferAndSendAnswer = async () => {
        if (!projectorState?.webRtcState?.offer) return;
        const peerConnection = await createPeerConnectionWithAnswer(projectorState?.webRtcState?.offer as RTCSessionDescription);
        setPc2(pc2);

        peerConnection.ontrack = (event) => {
            console.log("Received track event:", event);
            const video = remoteVideoRef.current!;
            video.srcObject = event.streams[0];
        };

        await webRtcStreamApi.webRtcControllerSetAnswer({ payload: peerConnection.localDescription! });
    }

    return (
        <>
            <div style={{ display: "flex", height: "100vh", width: "100%", backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
                <video ref={remoteVideoRef} muted autoPlay></video>

            </div>
        </>
    );
};
