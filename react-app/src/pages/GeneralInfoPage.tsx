import React, { useEffect, useState } from "react";
import { Balancy, SmartObjectsUnnyProfile } from "@balancy/core";

const GeneralInfoPage: React.FC = () => {
    const [generalInfoText, setGeneralInfoText] = useState<string>("");

    // Function to prepare general info text
    const prepareGeneralInfoText = (): string => {
        const profile = Balancy.Profiles.system as SmartObjectsUnnyProfile | null;

        if (!profile || !profile.generalInfo) {
            return "No profile data available.";
        }

        const info = profile.generalInfo;

        return `UserId:            ${info.profileId}\n` +
            `DeviceId:          ${info.deviceId}\n` +
            `CustomId:          ${info.customId}\n` +
            `AppVersion:        ${info.appVersion}\n` +
            `EngineVersion:     ${info.engineVersion}\n` +
            `Platform:          ${info.platformId}\n` +
            `Country:           ${info.country}\n` +
            `SystemLanguage:    ${info.systemLanguage}\n` +
            `GameLocalization:  ${info.gameLocalization}\n` +
            `Session:           ${info.session}\n` +
            `IsNewUser:         ${info.isNewUser}\n` +
            `FirstLoginTime:    ${info.firstLoginTime}\n` +
            `PlayTime:          ${info.playTime}\n` +
            `TimeSinceInstall:  ${info.timeSinceInstall}\n` +
            `TimeSincePurchase: ${info.timeSincePurchase}\n` +
            `Level:             ${info.level}\n` +
            `TutorialStep:      ${info.tutorialStep}\n` +
            `TrafficSource:     ${info.trafficSource}\n` +
            `TrafficCampaign:   ${info.trafficCampaign}\n` +
            `DeviceModel:       ${info.deviceModel}\n` +
            `DeviceName:        ${info.deviceName}\n` +
            `DeviceType:        ${info.deviceType}\n` +
            `OperatingSystem:   ${info.operatingSystem}\n` +
            `OperatingSystemFamily: ${info.operatingSystemFamily}\n` +
            `SystemMemorySize:  ${info.systemMemorySize}`;
    };

    const updateData = () => {
        const infoText = prepareGeneralInfoText();
        setGeneralInfoText(infoText);
    };

    // Use effect to refresh the general info every second
    useEffect(() => {
        updateData();

        // Refresh data every second
        const intervalId = setInterval(updateData, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ textAlign: "left", padding: "20px", fontFamily: "monospace" }}>
            <h2>General Info</h2>
            <pre>{generalInfoText}</pre>
        </div>
    );
};

export default GeneralInfoPage;
