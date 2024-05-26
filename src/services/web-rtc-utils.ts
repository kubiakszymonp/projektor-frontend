import { WebRtcConnectionStructure } from "../api/generated";

export const createPeerConnectionWithOffer = async (stream: MediaStream) => {
    return new Promise<RTCPeerConnection>(async (resolve, reject) => {
        const pc = new RTCPeerConnection();
        const tracks = stream.getTracks();
        tracks.forEach(track => {
            pc.addTrack(track, stream);
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        pc.onicegatheringstatechange = async () => {
            if (pc.iceGatheringState === "complete") {
                console.log("[createPeerConnectionWithOffer] iceGatheringState complete")
                resolve(pc);
            }
        }

        pc.onconnectionstatechange = () => {
            console.log("peerConnection.connectionState", pc.connectionState);
        };
    });
};

export const createPeerConnectionWithAnswer = async (offer: RTCSessionDescriptionInit, onTrackCallback: (event: RTCTrackEvent) => void) => {
    return new Promise<RTCPeerConnection>(async (resolve, reject) => {
        const pc = new RTCPeerConnection();
        pc.ontrack = onTrackCallback;
        pc.onicegatheringstatechange = async () => {
            if (pc.iceGatheringState === "complete") {
                console.log("[createPeerConnectionWithAnswer] iceGatheringState complete")
                resolve(pc);
            }
        }

        pc.onconnectionstatechange = () => {
            console.log("peerConnection.connectionState", pc.connectionState);
        };

        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
    });
};

export const onTrackEventAsVideoSource = (ontrackEvent: RTCTrackEvent, videoRef: React.RefObject<HTMLVideoElement>) => {
    if (!ontrackEvent.streams.length) return;
    if (!videoRef.current) return;
    videoRef.current.srcObject = ontrackEvent.streams[0];
}

export const acceptRtcAnswer = async (pc: RTCPeerConnection, answer: RTCSessionDescriptionInit) => {
    await pc?.setRemoteDescription(answer);
}


export enum ConnectingState {
    UNINITIALIZED,
    OFFER_READY,
    ANSWER_READY,
}

export const getWebRtcState = (webRtcStructure?: WebRtcConnectionStructure) => {
    if (!webRtcStructure) return ConnectingState.UNINITIALIZED;
    if (!webRtcStructure.offer) return ConnectingState.UNINITIALIZED;
    if (webRtcStructure.offer && !webRtcStructure.answer) return ConnectingState.OFFER_READY;
    if (webRtcStructure.offer && webRtcStructure.answer) return ConnectingState.ANSWER_READY;
};