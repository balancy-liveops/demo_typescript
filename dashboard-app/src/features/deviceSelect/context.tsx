import React, {createContext, ReactNode, useContext, useState} from "react";
import {DeviceConfig} from "./devicesConfig";

export type DeviceSelectContextType = {
    selectedDeviceId?: string;
    setSelectedDeviceId: (id?: string) => void;
    isLandscape: boolean;
    setIsLandscape: (landscape: boolean) => void;
}

export const DeviceSelectContext = createContext<DeviceSelectContextType>({
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
        setSelectedDeviceId
    ] = useState<DeviceConfig['id']>();
    const [
        isLandscape,
        setIsLandscape
    ] = useState(false);
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
