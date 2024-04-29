import { Button } from "@mui/material";
import { btoa } from "buffer";
import React, { useEffect, useRef, useState } from "react";
import { liveStreamingApi, uploadedFilesApi } from "../../api";
import { Computer, Face, Forest, PlayArrow, Stop } from "@mui/icons-material";

const CHUNK_DURATION = 1000;
const FPS = 24;

enum CameraType {
  FRONT = "user",
  BACK = "environment",
  SCREEN = "screen",
}

export const getSupportedCodecs = () => {
  const codecs = [
    "video/webm; codecs=vp8",
    "video/webm; codecs=vp9",
    "audio/webm; codecs=opus",
    'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
    "video/webm;codecs=h264,opus",
    "video/webm;codecs=h264",
    "video/mp4;codecs=h264",
    "video/webm;",
  ];

  codecs.forEach((codec) => {
    if (MediaRecorder.isTypeSupported(codec)) {
      console.log(`${codec} is supported.`);
    } else {
      console.log(`${codec} is not supported.`);
    }
  });
};

const MIME_TYPE = 'video/webm;  codecs="avc1.42E01F"';

export const Streamer: React.FC = () => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturingContext, setCapturingContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [displayContext, setDisplayContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const getAvailableDevices = async () => {
    const availableDevices = await navigator.mediaDevices.enumerateDevices();
    const inputDevices = availableDevices.filter((device) =>
      device.kind.includes("videoinput")
    );
    inputDevices.forEach((device) => {
      console.log((device as any).getCapabilities());
    });
    console.log({ inputDevices });
  };

  useEffect(() => {
    getSupportedCodecs();
    getAvailableDevices();
    if (
      !displayCanvasRef.current ||
      !captureCanvasRef.current ||
      !videoRef.current
    )
      return;

    const ctx = captureCanvasRef.current.getContext("2d");
    const displayCtx = displayCanvasRef.current.getContext("2d");

    setCapturingContext(ctx);
    setDisplayContext(displayCtx);

    videoRef.current.addEventListener("play", () => {
      function step() {

        captureCanvasRef.current!.width = videoRef.current!.videoWidth;
        captureCanvasRef.current!.height = videoRef.current!.videoHeight;

        ctx?.drawImage(
          videoRef.current!,
          0,
          0,
          videoRef.current!.videoWidth,
          videoRef.current!.videoHeight
        );
        drawOnDisplayCanvas(
          displayCtx!,
          videoRef.current!,
          displayCanvasRef.current!
        );

        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, [captureCanvasRef, videoRef]);

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
    if (!capturingContext) return;
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
    if (!capturingContext || !captureCanvasRef.current || !videoRef.current)
      return;

    await liveStreamingApi.liveStreamingControllerStartStream();

    setIsStreaming(true);
    const stream = captureCanvasRef.current.captureStream(FPS);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MIME_TYPE,
      audioBitsPerSecond: 0,
    });
    setMediaRecorder(mediaRecorder);

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
      mediaRecorder.stop();
    };

    mediaRecorder.onstop = () => {
      const formData = new FormData();

      const blob = new Blob(chunks, {
        type: MIME_TYPE,
      });

      formData.append("file", blob, new Date().getTime() + ".mp4");

      liveStreamingApi.liveStreamingControllerUploadStreamChunk({
        data: formData,
      });

      chunks.splice(0, chunks.length);

      if ((mediaRecorder as any).doNotResume === true) return;
      mediaRecorder.start(CHUNK_DURATION);
    };

    mediaRecorder.start(CHUNK_DURATION);
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
    clearCanvas(captureCanvasRef.current!, capturingContext!);
    stopCamera();
  };

  const endStreaming = () => {
    liveStreamingApi.liveStreamingControllerStopStream();
    setIsStreaming(false);
    (mediaRecorder as any).doNotResume = true;
    mediaRecorder?.stop();
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
        <canvas
          ref={displayCanvasRef}
          id="displayCanvas"
          style={{
            zIndex: 1,
          }}
        ></canvas>
      </div>
      <canvas
        ref={captureCanvasRef}
        id="capturingCanvas"
        style={{ visibility: "hidden" }}
      ></canvas>
      <video
        ref={videoRef}
        style={{
          visibility: "hidden",
        }}
      ></video>
    </div>
  );
};
