import React, {createContext, ReactNode, useContext, useState, useEffect} from "react";
import {DeviceConfig} from "./devicesConfig";

const STORAGE_KEY_DEVICE_ID = 'balancy-selected-device-id';
const STORAGE_KEY_LANDSCAPE = 'balancy-device-landscape';

type DeviceSelectContextType = {
    selectedDeviceId?: string;
    setSelectedDeviceId: (id?: string) => void;
    isLandscape: boolean;
    setIsLandscape: (landscape: boolean) => void;
}

const DeviceSelectContext = createContext<DeviceSelectContextType>({
    setSelectedDeviceId: ()=> {},
    isLandscape: false,
    setIsLandscape: ()=> {},
});

export function useDeviceSelectContext() {
    return useContext(DeviceSelectContext);
}

type DeviceSelectProviderProps = {
    children?: ReactNode;
}
export function DeviceSelectProvider({
    children
}: DeviceSelectProviderProps): JSX.Element | null {
    const [
        selectedDeviceId,
        setSelectedDeviceIdState
    ] = useState<DeviceConfig['id'] | undefined>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
        return saved || 'iphone-16-pro-max';
    });
    const [
        isLandscape,
        setIsLandscapeState
    ] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY_LANDSCAPE);
        return saved === 'true';
    });

    const setSelectedDeviceId = (id?: string) => {
        setSelectedDeviceIdState(id);
        if (id) {
            localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
        } else {
            localStorage.removeItem(STORAGE_KEY_DEVICE_ID);
        }
    };

    const setIsLandscape = (landscape: boolean) => {
        setIsLandscapeState(landscape);
        localStorage.setItem(STORAGE_KEY_LANDSCAPE, String(landscape));
    };
    return (
        <DeviceSelectContext.Provider value={{
            selectedDeviceId,
            setSelectedDeviceId,
            isLandscape,
            setIsLandscape,
        }}>
            {children}
        </DeviceSelectContext.Provider>
    )
}
