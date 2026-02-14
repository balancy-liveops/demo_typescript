import React, {ReactNode, useEffect, useMemo, useRef} from "react";

import {useDeviceSelectContext} from "./context";
import {ALL_DEVICES_CONFIG} from "./devicesConfig";
import {IAPView} from "../simulateIAP";

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

    const styles = {
        container: {
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: selectedDevice ? '#fff' : BACK_COLOR,
            boxSizing: 'border-box' as const,
            padding: '12px',
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
    const totalHeight = (height - (isLandscape ? 0 : spaceForIsland)) * pixelRatio;
    const mockupWidth = (isLandscape ? totalHeight : totalWidth) + paddingLeft + paddingRight;
    const mockupHeight = (isLandscape ? totalWidth : totalHeight) + paddingTop + paddingBottom;

    useEffect(() => {
        const parent = refParent.current;
        const child = refChild.current;
        const device = refDevice.current;
        const under = refUnder.current;

        let timeout: ReturnType<typeof setTimeout> | null = null;

        function cleanTimeout() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        }

        function resize() {
            if (!(parent && child && device && under)) return;

            const scaleX = parent.clientWidth / totalWidth;
            const scaleY = parent.clientHeight / totalHeight;

            const scaleFactor = Math.min(scaleX, scaleY);
            const transformDevice = `scale(${scaleFactor}) ${isLandscape ? 'rotate(-90deg)' : ''}`;

            under.style.transform = transformDevice;
            child.style.transform = `scale(${scaleFactor})`;
            device.style.transform = transformDevice;
        }

        const resizeObserver = new ResizeObserver(entries => {
            cleanTimeout();
            timeout = setTimeout(resize, 100);
        })

        if (parent) {
            resize();
            resizeObserver.observe(parent);
        }

        return () => {
            resizeObserver.disconnect();
            cleanTimeout();
        }
    }, [totalWidth, totalHeight, isLandscape]);

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
                        borderRadius: isLandscape ? undefined : screenBorderRadius,
                        position: 'relative',
                        zIndex: 1,
                        boxSizing: 'border-box',
                        paddingTop: isLandscape ? undefined : `${spaceForIsland * pixelRatio}px`,
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
