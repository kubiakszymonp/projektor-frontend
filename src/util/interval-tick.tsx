import { useEffect, useState } from "react";

export const useIntervalTick = (interval: number) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setValue(value + 1);
        }, interval);

        return () => {
            clearTimeout(timeout);
        };
    }, [value]);

    return value;
};