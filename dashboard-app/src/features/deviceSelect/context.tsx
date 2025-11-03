import React, {createContext, ReactNode, useContext, useState} from "react";
import {DeviceConfig} from "./devicesConfig";

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
        setSelectedDeviceId
    ] = useState<DeviceConfig['id'] | undefined>('iphone-16-pro-max');
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
