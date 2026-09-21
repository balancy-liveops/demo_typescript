import React, {ReactNode, useEffect, useLayoutEffect, useMemo, useRef} from "react";

import {Balancy} from "@balancy/core";
import {useDeviceSelectContext} from "./context";
import {ALL_DEVICES_CONFIG} from "./devicesConfig";
import {IAPView} from "../simulateIAP";

import {fitDeviceScale} from './deviceScale';

const BACK_COLOR = '#1a1a2e';

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

    const refParent = useRef<HTMLDivElement>(null);
    const refChild = useRef<HTMLDivElement>(null);
    const refDevice = useRef<HTMLDivElement>(null);
    const refUnder = useRef<HTMLDivElement>(null);

    // Prepared before #device-wrapper exists, the shell iframe lands in document.body and overflows the mockup.
    useEffect(() => {
        Balancy.API.prepareWebView();
    }, []);

    const styles = {
        container: {
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: selectedDevice ? 'transparent' : BACK_COLOR,
            boxSizing: 'border-box' as const,
            padding: selectedDevice ? '12px' : '0',
        }
    }

    const {
        width = 0,
        height = 0,
        mockup
    } = selectedDevice ?? {};

    const {
        paddingTop = 0,
        paddingRight = 0,
        paddingBottom = 0,
        paddingLeft = 0,
        deviceBorderRadius = 0,
        screenBorderRadius = 0,
        pixelRatio = 1,
        spaceForIsland = 0,
    } = mockup ?? {};

    const totalWidth = width * pixelRatio;
    const totalHeight = height * pixelRatio;
    const mockupWidth = (isLandscape ? totalHeight : totalWidth) + paddingLeft + paddingRight;
    const mockupHeight = (isLandscape ? totalWidth : totalHeight) + paddingTop + paddingBottom;

    useLayoutEffect(() => {
        const parent = refParent.current;
        const child = refChild.current;
        if (!parent || !child) return;
        const resize = () => {
            const frameWidth = mockup ? (isLandscape ? mockupHeight : mockupWidth) : totalWidth;
            const frameHeight = mockup ? (isLandscape ? mockupWidth : mockupHeight) : totalHeight;
            const scale = fitDeviceScale(parent.clientWidth, parent.clientHeight, frameWidth, frameHeight);
            child.style.transform = `scale(${scale})`;
            const frameTransform = `scale(${scale}) ${isLandscape ? 'rotate(-90deg)' : ''}`;
            if (refDevice.current) refDevice.current.style.transform = frameTransform;
            if (refUnder.current) refUnder.current.style.transform = frameTransform;
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(parent);
        return () => observer.disconnect();
    }, [selectedDeviceId, totalWidth, totalHeight, mockupWidth, mockupHeight, mockup, isLandscape]);

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

    return (
        <div
            style={styles.container}
        >
            <div
                ref={refParent}
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {mockup != null && (
                    <div
                        ref={refUnder}
                        style={{
                            position: 'absolute',
                            zIndex: 0,
                            width: `${mockupWidth - 5}px`,
                            height: `${mockupHeight - 5}px`,
                            borderRadius: deviceBorderRadius,
                            backgroundColor: BACK_COLOR,
                        }}
                    ></div>
                )}

                <div
                    ref={refChild}
                    style={{
                        width: `${totalWidth}px`,
                        height: `${totalHeight}px`,
                        borderRadius: screenBorderRadius,
                        flexShrink: 0,
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 1,
                        boxSizing: 'border-box',
                        paddingTop: isLandscape ? undefined : `${spaceForIsland * pixelRatio}px`,
                        paddingLeft: isLandscape ? `${spaceForIsland * pixelRatio}px` : undefined,
                        backgroundColor: BACK_COLOR,
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
                        ref={refDevice}
                        style={{
                            position: 'absolute',
                            zIndex: 2,
                            backgroundImage: `url(${mockup.image})`,
                            backgroundSize: `${mockupWidth}px ${mockupHeight}px`,
                            width: `${mockupWidth}px`,
                            height: `${mockupHeight}px`,
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </div>
        </div>
    );
}
