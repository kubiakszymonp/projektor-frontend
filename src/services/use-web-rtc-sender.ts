
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

export const createPeerConnectionWithAnswer = async (offer: RTCSessionDescriptionInit) => {
    return new Promise<RTCPeerConnection>(async (resolve, reject) => {
        const pc = new RTCPeerConnection();
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        pc.onicegatheringstatechange = async () => {
            if (pc.iceGatheringState === "complete") {
                console.log("[createPeerConnectionWithAnswer] iceGatheringState complete")
                resolve(pc);
            }
        }

        pc.onconnectionstatechange = () => {
            console.log("peerConnection.connectionState", pc.connectionState);
        };
    });

};
