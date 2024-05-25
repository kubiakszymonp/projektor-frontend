import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Computer, Face, Forest, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum } from "../../api/generated";
import { displayStateApi, projectorApi, webRtcStreamApi } from "../../api";
import { useNotifyOnProjectorUpdate } from "../../services/useNofifyOrganizationEdit";
import { jwtPersistance } from "../../services/jwt-persistance";

export const WebRtcStream: React.FC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const organizationId = useMemo(() => jwtPersistance.getDecodedJwt()?.organizationId, []);
    const [projectorState, setProjectorState] = useState<GetDisplayDto>();
    const [pc1, setPc1] = useState<RTCPeerConnection>();
    const [pc2, setPc2] = useState<RTCPeerConnection>();

    useEffect(() => {

    }, []);

    const clear = async () => {
        await webRtcStreamApi.webRtcControllerSetOffer({ payload: null as any });
        await webRtcStreamApi.webRtcControllerSetAnswer({ payload: null as any });
    }

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
        if (projectorState?.webRtcState?.offer && projectorState?.webRtcState?.answer) {
            acceptAnswer();
        }
    }, [projectorState]);

    const startStreamAndSendOffer = async () => {
        const pc1 = new RTCPeerConnection();
        setPc1(pc1);
        debugger
        const stream = localVideoRef.current!.srcObject as MediaStream;
        const tracks = stream.getTracks();
        console.log("Local tracks:", tracks); // Add this log
        tracks.forEach(track => {
            pc1.addTrack(track, stream);
            console.log("Track added:", track); // Add this log
        });
        const offer = await pc1.createOffer();
        await pc1.setLocalDescription(offer);

        pc1.onicegatheringstatechange = async () => {
            if (pc1.iceGatheringState === "complete") {
                console.log("Ice gathering complete");
                await webRtcStreamApi.webRtcControllerSetOffer({ payload: pc1.localDescription! });
            }
        };
    };

    const acceptOfferAndSendAnswer = async () => {
        const pc2 = new RTCPeerConnection();
        setPc2(pc2);

        pc2.ontrack = (event) => {
            debugger
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

    const startCapture = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = localVideoRef.current!;
        video.srcObject = stream;
    };

    const acceptAnswer = async () => {
        pc1?.setRemoteDescription(new RTCSessionDescription(projectorState!.webRtcState!.answer! as any));
    }


    return (
        <>
            <div style={{ display: "flex", height: "100vh", width: "100%", backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
                <video ref={localVideoRef} muted autoPlay></video>
                <video ref={remoteVideoRef} muted autoPlay></video>

            </div>
            <button onClick={() => { clear() }}>clear</button>
            <button onClick={() => { startCapture() }}>startCapture</button>
            <button onClick={() => { startStreamAndSendOffer() }}>startStreamAndSendOffer</button>
        </>
    );
};
