import React, { useEffect, useState } from "react";
import { Balancy, SmartObjectsUnnyProfile, AdsAdType, SmartObjectsAdInfo } from "@balancy/core";

const AdsPage: React.FC = () => {
    const [header, setHeader] = useState<string>("Loading...");
    const [adsInfo, setAdsInfo] = useState<Record<AdsAdType, SmartObjectsAdInfo | undefined>>({
        [AdsAdType.None]: undefined,
        [AdsAdType.Rewarded]: undefined,
        [AdsAdType.Interstitial]: undefined,
        [AdsAdType.Custom]: undefined,
    });

    const refreshAds = () => {
        const profile = Balancy.Profiles.system;
        if (!profile) {
            console.error("Balancy profile is not available.");
            return;
        }

        const adsProfile = profile.adsInfo;

        setHeader(`[$$$]: ${adsProfile.revenueTotal.toFixed(3)} - Today: ${adsProfile.revenueToday.toFixed(3)}`);

        const updatedAdsInfo: Record<AdsAdType, SmartObjectsAdInfo | undefined> = {
            [AdsAdType.None]: undefined,
            [AdsAdType.Rewarded]: adsProfile.getAdInfo(AdsAdType.Rewarded) || undefined,
            [AdsAdType.Interstitial]: adsProfile.getAdInfo(AdsAdType.Interstitial) || undefined,
            [AdsAdType.Custom]: adsProfile.getAdInfo(AdsAdType.Custom) || undefined,
        };

        setAdsInfo(updatedAdsInfo);
    };

    const addAdRevenue = (adType: AdsAdType) => {
        const revenue = Math.random() * (0.01 - 0.001) + 0.001; // Random value between 0.001 and 0.01
        Balancy.API.trackAdRevenue(adType, revenue, "cheat_panel");
        refreshAds();
    };

    useEffect(() => {
        if (Balancy.Main.isReadyToUse) {
            refreshAds();
        }
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>{header}</h2>
            <div style={{ display: "flex", gap: "20px" }}>
                {Object.values(AdsAdType)
                    .filter((type): type is AdsAdType => typeof type === "number" && type !== AdsAdType.None)
                    .map((type) => (
                        <AdPanel
                            key={type}
                            adType={type}
                            info={adsInfo[type]}
                            onAddRevenue={() => addAdRevenue(type)}
                        />
                    ))}
            </div>
        </div>
    );
};

interface AdPanelProps {
    adType: AdsAdType;
    info?: SmartObjectsAdInfo;
    onAddRevenue: () => void;
}

const AdPanel: React.FC<AdPanelProps> = ({ adType, info, onAddRevenue }) => {
    return (
        <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px", width: "200px" }}>
            <h3>{AdsAdType[adType]}</h3>
            {info ? (
                <p>
                    <strong>[$$$]:</strong> {info.revenue.toFixed(3)} <br />
                    <strong>Today:</strong> {info.revenueToday.toFixed(3)} <br />
                    <strong>[Watched]:</strong> {info.count} <br />
                    <strong>Today:</strong> {info.countToday}
                </p>
            ) : (
                <p>Loading...</p>
            )}
            <button onClick={onAddRevenue} style={{ marginTop: "10px" }}>
                Add Revenue
            </button>
        </div>
    );
};

export default AdsPage;
