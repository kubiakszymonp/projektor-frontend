import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { environment } from "../environment";

const ORGANIZATION_UPDATE_EVENT_NAME = 'organizationUpdated';

export const useNotifyOnProjectorUpdate = (onChange: () => void, organizationId: string) => {
    return useEffect(() => {
        const socket = io(environment.BACKEND_HOST, {
            secure: true,
            query: { organizationId },
        });

        socket.on(ORGANIZATION_UPDATE_EVENT_NAME, () => {
            onChange();
        });

        return () => {
            socket.disconnect();
        };
    }, []);
};