import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import { BASE_PATH } from "../../api";

export const StreamPlayer: React.FC<{ organizationId: number }> = ({
  organizationId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        maxBufferLength: 1,
        liveBackBufferLength: 0,
        liveSyncDuration: 0.1,
        liveMaxLatencyDuration: 0.2,
        liveDurationInfinity: true,
        highBufferWatchdogPeriod: 1,
        lowLatencyMode: true
      });

      hls.loadSource(
        BASE_PATH + "/api/uploaded-files/stream-manifest/" + organizationId
      );
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        videoRef.current!.play();
      });

      return () => {
        hls.detachMedia();
        hls.stopLoad();
        hls.destroy();
      };
    }
  }, [videoRef]);

  return (
    <div>
      <video style={{}} muted ref={videoRef}></video>
    </div>
  );
};
