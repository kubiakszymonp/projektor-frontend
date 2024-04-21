import { Button } from "@mui/material";
import { btoa } from "buffer";
import React, { useEffect, useRef, useState } from "react";
import { BASE_PATH, uploadedFilesApi } from "../../api";

const CHUNK_DURATION = 400;
const FPS = 24;

enum CameraType {
  FRONT = "user",
  BACK = "environment",
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
    'video/webm; codecs="avc1.42E01F"',
  ];

  codecs.forEach((codec) => {
    if (MediaRecorder.isTypeSupported(codec)) {
      console.log(`${codec} is supported.`);
    } else {
      console.log(`${codec} is not supported.`);
    }
  });
};

const MIME_TYPE = 'video/webm; codecs="avc1.42E01F"';

export const Streamer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  useEffect(() => {
    getSupportedCodecs();
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    setContext(ctx);

    videoRef.current.addEventListener("play", () => {
      function step() {
        const videoWidth = videoRef.current!.videoWidth;
        const videoHeight = videoRef.current!.videoHeight;

        const aspectRatio = videoWidth / videoHeight;
        const canvasAspectRation =
          canvasRef.current!.width / canvasRef.current!.height;

        let width = 0;
        let height = 0;
        let x = 0;
        let y = 0;

        if (aspectRatio > canvasAspectRation) {
          width = canvasRef.current!.width;
          height = width / aspectRatio;
          y = (canvasRef.current!.height - height) / 2;
          x = 0;
        }

        if (aspectRatio < canvasAspectRation) {
          height = canvasRef.current!.height;
          width = height * aspectRatio;
          x = (canvasRef.current!.width - width) / 2;
          y = 0;
        }

        ctx?.drawImage(videoRef.current!, x, y, width, height);
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, [canvasRef, videoRef]);

  const startCamera = async (cameraType: CameraType) => {
    if (!videoRef.current) return;
    if (!context) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraType,
        },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error(error);
    }
  };

  const beginStream = async () => {
    if (!context || !canvasRef.current || !videoRef.current) return;

    await uploadedFilesApi.uploadedFilesControllerStartStream();

    setIsStreaming(true);
    const stream = canvasRef.current.captureStream(FPS);
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

      uploadedFilesApi.uploadedFilesControllerUploadStreamChunk({
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
    await startCamera(cameraType);
    setIsCapturing(true);
  };

  const stopCamera = () => {
    if (!videoRef.current) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };

  const stopCapturing = () => {
    setIsCapturing(false);
    clearCanvas(canvasRef.current!, context!);
    stopCamera();
  };

  const endStreaming = () => {
    uploadedFilesApi.uploadedFilesControllerStopStream();
    setIsStreaming(false);
    (mediaRecorder as any).doNotResume = true;
    mediaRecorder?.stop();
  };

  return (
    <div
      style={{
        position: "fixed",
      }}
    >
      <div style={{ position: "absolute" }}>
        {!isCapturing && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => startCapturing(CameraType.FRONT)}
            >
              Przednia kamera
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => startCapturing(CameraType.BACK)}
            >
              Tylna kamera
            </Button>
          </>
        )}
        {isCapturing && (
          <>
            <Button
              variant="contained"
              color="error"
              onClick={() => stopCapturing()}
            >
              Zatrzymaj podgląd
            </Button>
            {!isStreaming && (
              <Button
                variant="contained"
                color="info"
                onClick={() => beginStream()}
              >
                Rzutuj
              </Button>
            )}
            {isStreaming && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => endStreaming()}
              >
                Zatrzymaj rzutowanie
              </Button>
            )}
          </>
        )}
      </div>
      <canvas ref={canvasRef} id="canvas" width={400} height={400}></canvas>
      <video
        ref={videoRef}
        style={{
          visibility: "hidden",
        }}
      ></video>
    </div>
  );
};
