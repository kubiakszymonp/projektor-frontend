import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import { BASE_PATH, liveStreamingApi } from "../../api";

export const StreamPlayer: React.FC<{ organizationId: number }> = ({
  organizationId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tick, setTick] = React.useState(0);
  const [hls, setHls] = React.useState<Hls | null>(null);

  // resize video loop
  useEffect(() => {
    if (!videoRef.current) return;
    const timeout = setTimeout(() => {
      resize(videoRef.current!);
      setTick(tick + 1);
    }, 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, [tick]);

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

  useEffect(() => {
    initHls();
    return () => {
      hls?.detachMedia();
      hls?.stopLoad();
      hls?.destroy();
    };
  }, [videoRef]);

  const initHls = async () => {
    if (!videoRef.current) return;
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 1,
        liveBackBufferLength: 0,
        liveSyncDuration: 0.1,
        liveMaxLatencyDuration: 0.2,
        liveDurationInfinity: true,
        highBufferWatchdogPeriod: 1,
        lowLatencyMode: true,
      });

      const res =
        await liveStreamingApi.liveStreamingControllerGetStreamManifest(
          String(organizationId)
        );

      if (res.config.url === undefined) throw Error("No stream url");

      hls.loadSource(res.config.url);
      hls.attachMedia(videoRef?.current);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        videoRef.current!.play();
      });

      setHls(hls);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <video muted ref={videoRef}></video>
    </div>
  );
};
