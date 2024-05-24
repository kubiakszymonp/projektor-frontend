import { Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Computer, Face, Forest, PlayArrow, Stop } from "@mui/icons-material";
import { GetDisplayDto, GetDisplayDtoDisplayTypeEnum } from "../../api/generated";
import { displayPartsToString } from "typescript";
import { displayStateApi, webRtcStreamApi } from "../../api";

enum CameraType {
  FRONT = "user",
  BACK = "environment",
  SCREEN = "screen",
}

enum ConnectionState {
  Uninitialized,
  WaitingForAnswer,
  Connected
}

export const WebRtcStreamSender: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [webRtcState, setWebRtcState] = useState(ConnectionState.Uninitialized);

  useEffect(() => {
    setWebRtcAsDisplayType();
    return stopCamera;
  }, []);


  const setWebRtcAsDisplayType = async () => {

    await webRtcStreamApi.webRtcControllerSetOffer({ payload: {} });
    await webRtcStreamApi.webRtcControllerSetAnswer({ payload: {} });
    await displayStateApi.displayStateControllerUpdateDisplayState({
      displayType: GetDisplayDtoDisplayTypeEnum.WebRtc
    });
  }

  const drawOnDisplayCanvas = (
    ctx: CanvasRenderingContext2D,
    videoElement: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ) => {
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

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(videoElement, 0, 0, width, height);
  };

  const startCamera = async (cameraType: CameraType) => {
    if (!videoRef.current) return;
    try {
      let stream: MediaStream;
      if (cameraType === CameraType.SCREEN) {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraType,
          },
        });
      }
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error(error);
    }
  };

  const beginStream = async () => {
    const peerConnection = new RTCPeerConnection();
    const stream = videoRef.current?.srcObject as MediaStream;
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    peerConnection.onicegatheringstatechange = async () => {
      if (peerConnection.iceGatheringState === "complete") {
        await webRtcStreamApi.webRtcControllerSetOffer({
          payload: peerConnection.localDescription!
        });
      }
    }

    setWebRtcState(ConnectionState.WaitingForAnswer);
  };

  const clearCanvas = (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) => {
    if (!context || !canvas) return;
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const startCapturing = async (cameraType: CameraType) => {
    stopCapturing();
    await startCamera(cameraType);
    setIsCapturing(true);
  };

  const stopCamera = () => {
    if (!videoRef.current) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const tracks = stream?.getTracks();
    tracks?.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };

  const stopCapturing = () => {
    setIsCapturing(false);
    stopCamera();
  };

  const endStreaming = () => {

  };

  return (
    <div style={{ overflow: "hidden", height: "100vh", width: "100%" }}>
      <div
        style={{
          position: "absolute",
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
          onClick={() => startCapturing(CameraType.FRONT)}
        >
          <Face />
        </Button>
        <Button
          sx={{ m: 1 }}
          variant="contained"
          color="primary"
          onClick={() => startCapturing(CameraType.BACK)}
        >
          <Forest />
        </Button>
        <Button
          sx={{ m: 1 }}
          variant="contained"
          color="primary"
          onClick={() => startCapturing(CameraType.SCREEN)}
        >
          <Computer />
        </Button>
      </div>
      <div
        style={{
          position: "absolute",
          zIndex: 5,
          display: "flex",
          justifyContent: "center",
          width: "100%",
          bottom: "60px",
        }}
      >
        {!isStreaming && (
          <Button
            sx={{ m: 1 }}
            variant="contained"
            size="large"
            color="success"
            onClick={() => beginStream()}
          >
            <PlayArrow fontSize="large" />
          </Button>
        )}
        {isStreaming && (
          <Button
            sx={{ m: 1 }}
            variant="contained"
            color="warning"
            onClick={() => endStreaming()}
          >
            <Stop fontSize="large" />
          </Button>
        )}
      </div>
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100%",
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <video
          ref={videoRef}
          muted
          autoPlay
          style={{
          }}
        ></video>
      </div>

    </div>
  );
};
