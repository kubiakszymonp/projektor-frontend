import React, { createContext, useCallback, useContext } from 'react';
import axios from 'axios';
import { environment } from '../environment';
import { jwtPersistance } from './jwt-persistance';
import { useNavigate } from 'react-router-dom';

export const BASE_PATH = environment.BACKEND_HOST;
const UPLOAD_ROOT = BASE_PATH + "/upload/";

// Create the context
const ApiContext = createContext<{
    getApi: <T, >(ApiClass: new (...args: any[]) => T) => T;
    getStaticResourceUrl: (resourceOid: string) => string;

}>({
    getApi: () => {
        throw new Error("ApiProvider not found");
    },
    getStaticResourceUrl: () => {
        throw new Error("ApiProvider not found");
    },
});


export const ApiProvider: React.FC<{
    children: React.ReactNode;

}> = ({ children }) => {
    const navigate = useNavigate();

    const createAxios = useCallback(() => {
        const interceptedAxios = axios.create();

        interceptedAxios.interceptors.request.use((config) => {
            config.headers["Authorization"] = "Bearer " + jwtPersistance.getJwt();
            return config;
        });

        interceptedAxios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    navigate('/login'); // Redirect to /login on 401 error
                }
                return Promise.reject(error);
            }
        );

        return interceptedAxios;
    }, []);

    const getApi = <T,>(ApiClass: new (...args: any[]) => T): T => {
        return new ApiClass(undefined, BASE_PATH, createAxios());
    };

    const getStaticResourceUrl = (resourceOid: string) => {
        if (!resourceOid) throw Error("File oid is empty");
        return UPLOAD_ROOT + resourceOid;
    };

    return (
        <ApiContext.Provider value={{
            getApi,
            getStaticResourceUrl,
        }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => {
    return useContext(ApiContext);
};
