import React, { useEffect, useRef } from "react";
import { useInterval } from "../../services/useInterval";
import { GetDisplayDto } from "../../api/generated";
import { webRtcStreamApi } from "../../api";

export const WebRtcStreamReciever: React.FC<{ displayState: GetDisplayDto }> = ({
  displayState,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useInterval(() => {
    if (!videoRef.current) return;
    resize(videoRef.current!);
  }, 200);

  useEffect(() => {
    acceptOfferAndSendAnswer(displayState.webRtcState?.offer);
  }, [displayState]);

  const acceptOfferAndSendAnswer = async (offer: any) => {

    const peerConnection = new RTCPeerConnection();
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    peerConnection.onicegatheringstatechange = async () => {
      if (peerConnection.iceGatheringState === "complete") {
        await webRtcStreamApi.webRtcControllerSetAnswer({
          payload: peerConnection.localDescription!
        });
      }
    }
  };

  const resize = (videoElement: HTMLVideoElement) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    const videoAspectRatio = videoWidth / videoHeight;
    const windowAspectRatio = windowWidth / windowHeight;

    let width = 0;
    let height = 0;

    // full horizontal
    if (videoAspectRatio > windowAspectRatio) {
      width = windowWidth;
      height = width / videoAspectRatio;
    }
    // full vertical
    else {
      height = windowHeight;
      width = height * videoAspectRatio;
    }

    videoElement.width = width;
    videoElement.height = height;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <video muted ref={videoRef}></video>
    </div>
  );
};
