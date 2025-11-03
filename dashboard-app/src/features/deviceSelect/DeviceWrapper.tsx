import * as React from 'react';
import {useDeviceSelectContext} from "./context";
import {ReactElement, ReactNode, useMemo} from "react";
import {ALL_DEVICES_CONFIG} from "./devicesConfig";
import {IAPView} from "../simulateIAP";

type DeviceWrapperProps = {
    children?: ReactNode;
};
export default function DeviceWrapper({
    children,
}: DeviceWrapperProps): JSX.Element | null {
    const {
        isLandscape,
        selectedDeviceId,
    } = useDeviceSelectContext();
    const selectedDevice = useMemo(() => {
        if (selectedDeviceId == null || selectedDeviceId === 'none') return undefined;
        return ALL_DEVICES_CONFIG.find(device => device.id === selectedDeviceId);
    }, [selectedDeviceId]);

    const styles = {
        container: {
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: selectedDevice ? '#fff' : '#1a1a2e',
        }
    }

    if (selectedDevice == null) {
        return (
            <div style={styles.container}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {children}
                    <div
                        id={'device-wrapper'}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    ></div>
                    <IAPView/>
                </div>
            </div>
        )
    }

    const {
        width,
        height,
        mockup
    } = selectedDevice;

    const {
        paddingTop = 0,
        paddingRight = 0,
        paddingBottom = 0,
        paddingLeft = 0,
        borderRadius = 0,
        pixelRatio = 1,
        spaceForIsland = 0,
    } = mockup ?? {};

    const mockupWidth = `${(isLandscape ? height : width) + paddingLeft + paddingRight}px`;
    const mockupHeight = `${(isLandscape ? width : height) + paddingTop + paddingBottom}px`;
    const totalWidth = (selectedDevice.width - (isLandscape ? spaceForIsland : 0)) * pixelRatio;
    return (
        <div style={styles.container}>
            <div
                style={{
                    width: totalWidth,
                    minWidth: totalWidth,
                    height: (selectedDevice.height - (isLandscape ? 0 : spaceForIsland)) * pixelRatio,
                    borderRadius,
                    overflow: 'hidden',
                    position: 'relative',
                    paddingTop: isLandscape ? undefined : `${spaceForIsland * pixelRatio}px`,
                    paddingLeft: isLandscape ? `${spaceForIsland * pixelRatio}px` : undefined,
                    transform: `scale(${pixelRatio ? 1 / pixelRatio : 1})`,
                    backgroundColor: '#1a1a2e',
                }}
            >
                {children}
                <div
                    id={'device-wrapper'}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                ></div>
                <IAPView/>
            </div>
            {mockup != null && (
                <div
                    style={{
                        position: 'absolute',
                        backgroundImage: `url(${mockup.image})`,
                        backgroundSize: `${mockupWidth} ${mockupHeight}`,
                        width: mockupWidth,
                        height: mockupHeight,
                        transform: `${isLandscape ? 'rotate(-90deg)' : 'none'}`,
                        pointerEvents: 'none',
                    }}
                ></div>
            )}
        </div>
    );
}
