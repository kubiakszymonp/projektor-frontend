import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

const MediaCaptureContext = createContext<{
    stream: MediaStream | null;
    setCapturingType: (type: CapturingStateType) => void
}>({
    stream: null,
    setCapturingType: () => { },
});

export enum CapturingStateType {
    FRONT = "user",
    BACK = "environment",
    SCREEN = "screen",
    NONE = "none",
};

const MediaCaptureProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraType, setCameraType] = useState<CapturingStateType>(CapturingStateType.NONE);

    useEffect(() => {
        if (cameraType !== CapturingStateType.NONE) {
            startUserMedia(cameraType);
        } else {
            stopUserMedia();
        }
    }, [cameraType]);

    const startUserMedia = useCallback(async (cameraType: CapturingStateType) => {
        try {
            console.log(`[MediaCaptureProvider] Starting user media stream with camera type: ${cameraType}`)
            let mediaStream: MediaStream;
            if (cameraType === CapturingStateType.SCREEN) {
                mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            } else {
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraType } });
            }
            setStream(mediaStream);
        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    }, []);

    const stopUserMedia = useCallback(() => {
        if (stream) {
            console.log('[MediaCaptureProvider] Stopping user media stream.');
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const setCapturingType = (type: CapturingStateType) => {
        setCameraType(type);
    }

    return (
        <MediaCaptureContext.Provider value={{ stream, setCapturingType }}>
            {children}
        </MediaCaptureContext.Provider>
    );
};

export const useMediaCapture = () => {
    return useContext(MediaCaptureContext);
};

export default MediaCaptureProvider;
