import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ServerContextType {
    wanServiceApiUrl: string;
    setWanServiceApiUrl: (url: string) => void;
    lanServiceApiUrl: string;
    setLanServiceApiUrl: (url: string) => void;
    isWanConnected: boolean;
    isLanConnected: boolean;
}

export const ServerContext = createContext<ServerContextType>({
    wanServiceApiUrl: "",
    setWanServiceApiUrl: () => { },
    lanServiceApiUrl: "",
    setLanServiceApiUrl: () => { },
    isWanConnected: false,
    isLanConnected: false,
});

export const ServerProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const {
        wanServiceApiUrl,
        setWanServiceApiUrl,
        lanServiceApiUrl,
        setLanServiceApiUrl,
        isWanConnected,
        isLanConnected,
    } = useServerConnectivity();

    return (
        <ServerContext.Provider
            value={{
                wanServiceApiUrl,
                setWanServiceApiUrl,
                lanServiceApiUrl,
                setLanServiceApiUrl,
                isWanConnected,
                isLanConnected,
            }}
        >
            {children}
        </ServerContext.Provider>
    );
};


export const useServerConnectivity = (pingInterval: number = 10000) => {
    const [wanServiceApiUrl, setWanServiceApiUrl] = useState<string>(
        localStorage.getItem("wanServiceApiUrl") || ""
    );
    const [lanServiceApiUrl, setLanServiceApiUrl] = useState<string>(
        localStorage.getItem("lanServiceApiUrl") || ""
    );
    const [isWanConnected, setIsWanConnected] = useState<boolean>(false);
    const [isLanConnected, setIsLanConnected] = useState<boolean>(false);

    useEffect(() => {
        localStorage.setItem("wanServiceApiUrl", wanServiceApiUrl);
    }, [wanServiceApiUrl]);

    useEffect(() => {
        localStorage.setItem("lanServiceApiUrl", lanServiceApiUrl);
    }, [lanServiceApiUrl]);

    useEffect(() => {
        const pingServers = async () => {
            if (wanServiceApiUrl) {
                const wanStatus = await pingServer(wanServiceApiUrl);
                setIsWanConnected(wanStatus);
            }

            if (lanServiceApiUrl) {
                const lanStatus = await pingServer(lanServiceApiUrl);
                setIsLanConnected(lanStatus);
            }
        };

        pingServers(); // Initial check
        const intervalId = setInterval(pingServers, pingInterval);

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [wanServiceApiUrl, lanServiceApiUrl, pingInterval]);

    return {
        wanServiceApiUrl,
        setWanServiceApiUrl,
        lanServiceApiUrl,
        setLanServiceApiUrl,
        isWanConnected,
        isLanConnected,
    };
};

export const pingServer = async (url: string, timeout: number = 5000) => {
    return axios.get(url, {
        timeout,
    }).then(() => true).catch(() => false);
}