import * as React from 'react';
import {useDeviceSelectContext} from "./context";
import {LANDSCAPE_DEVICES_CONFIG, PORTRAIT_DEVICES_CONFIG} from "./devicesConfig";

type DeviceSelectProps = {

};
export default function DeviceSelect(props: DeviceSelectProps): JSX.Element | null {
    const {
        selectedDeviceId,
        setSelectedDeviceId,
        isLandscape,
        setIsLandscape,
    } = useDeviceSelectContext();

    const config = isLandscape ? LANDSCAPE_DEVICES_CONFIG : PORTRAIT_DEVICES_CONFIG;
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
            }}
        >
            <select
                value={selectedDeviceId ?? 'none'}
                onChange={event => {
                    const {value} = event.target as HTMLSelectElement;
                    setSelectedDeviceId(value);
                }}
            >
                <option value={'none'}>None</option>
                {config.map(device => {
                    return (
                        <option
                            key={device.id}
                            value={device.id}
                        >
                            {`${device.name} - ${device.width} x ${device.height}`}
                        </option>
                    )
                })}
            </select>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                }}
            >
                Landscape:
                <input
                    type={'checkbox'}
                    style={{
                        transform: 'scale(1.5)',
                    }}
                    checked={isLandscape}
                    onChange={event => {
                        const isChecked = event.target.checked;
                        setIsLandscape(isChecked);
                        const withoutLandscape = selectedDeviceId?.replace('-landscape', '') ?? 'none';
                        setSelectedDeviceId(isChecked ? `${withoutLandscape}-landscape` : withoutLandscape);
                    }}
                />
            </div>
        </div>
    );
}
