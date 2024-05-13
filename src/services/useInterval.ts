import { useEffect, useState } from "react";

export const useInterval = (callback: () => void, delay: number) => {
    const [tick, setTick] = useState(0);
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            callback();
            setTick(tick + 1);
        }, delay);
        return () => {
            clearTimeout(timeout);
        };
    }, [tick]);
}