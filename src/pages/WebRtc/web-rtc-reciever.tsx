import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Computer, Face, Forest, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum } from "../../api/generated";
import { displayStateApi, projectorApi, webRtcStreamApi } from "../../api";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";
import { ConnectingState, createPeerConnectionWithAnswer, getWebRtcState, onTrackEventAsVideoSource } from "../../services/web-rtc-utils";

export const WebRtcStreamReciever2: React.FC = () => {
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);
    const [projectorState, setProjectorState] = useState<GetDisplayDto>();
    const [pc2, setPc2] = useState<RTCPeerConnection>();

    useEffect(() => {
        return () => {
            pc2?.close();
        };
    }, []);

    const onProjectorUpdate = async () => {
        const projectorState = await projectorApi.projectorControllerGetProjectorState();
        setProjectorState(projectorState.data);
    };

    useNotifyOnProjectorUpdate(onProjectorUpdate, String(organizationId));

    useEffect(() => {
        if (getWebRtcState(projectorState?.webRtcState) === ConnectingState.OFFER_READY) {
            acceptOfferAndSendAnswer();
        }
    }, [projectorState]);

    const acceptOfferAndSendAnswer = async () => {
        const pc2 = await createPeerConnectionWithAnswer(projectorState!.webRtcState!.offer! as any, async (event) => {
            onTrackEventAsVideoSource(event, remoteVideoRef);
        });

        setPc2(pc2);
        await webRtcStreamApi.webRtcControllerSetAnswer({ payload: pc2.localDescription! });
    }

    return (
        <>
            <div style={{ display: "flex", height: "100vh", width: "100%", backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
                <video ref={remoteVideoRef} muted autoPlay></video>

            </div>
        </>
    );
};
