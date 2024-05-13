import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { environment } from "../environment";


export const useNotifyOrganizationEdit = (onChange: () => void, organizationId: string) => {
    return useEffect(() => {
        const socket = io(environment.BACKEND_HOST, {
            secure: true,
            query: { organizationId },
        });

        socket.on("changed", () => {
            onChange();
        });

        return () => {
            socket.disconnect();
        };
    }, []);
};