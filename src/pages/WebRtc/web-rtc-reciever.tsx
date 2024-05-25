import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Computer, Face, Forest, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum } from "../../api/generated";
import { displayStateApi, projectorApi, webRtcStreamApi } from "../../api";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";

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
        const pc2 = new RTCPeerConnection();
        setPc2(pc2);

        pc2.ontrack = (event) => {
            console.log("Received track event:", event);
            const video = remoteVideoRef.current!;
             video.srcObject = event.streams[0];

        };

        await pc2.setRemoteDescription(new RTCSessionDescription(projectorState!.webRtcState!.offer! as any));
        const answer = await pc2.createAnswer();
        await pc2.setLocalDescription(answer);

        pc2.onicegatheringstatechange = async () => {
            if (pc2.iceGatheringState === "complete") {
                await webRtcStreamApi.webRtcControllerSetAnswer({ payload: pc2.localDescription! });
            }
        };

        pc2.onconnectionstatechange = () => {
            console.log("pc2.connectionState", pc2.connectionState);
        };

        pc2.onnegotiationneeded = async () => {
            console.log("onnegotiationneeded");
        }
    }

    return (
        <>
            <div style={{ display: "flex", height: "100vh", width: "100%", backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
                <video ref={remoteVideoRef} muted autoPlay></video>

            </div>
        </>
    );
};
