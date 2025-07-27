import React, { useState, useEffect } from "react";
import { Balancy, SmartObjectsDailyBonusInfo } from "@balancy/core";

// Define the LiveOpsDailyBonusType enum
enum LiveOpsDailyBonusType {
    CollectAllToReset = 0,
    SkipToReset = 1,
    CalendarReset = 2,
    SkipToResetCurrentWeek = 3,
}

// Helper function to convert enum value to string
const getDailyBonusTypeString = (type: number): string => {
    switch (type) {
        case LiveOpsDailyBonusType.CollectAllToReset:
            return "Collect All to Reset";
        case LiveOpsDailyBonusType.SkipToReset:
            return "Skip to Reset";
        case LiveOpsDailyBonusType.CalendarReset:
            return "Calendar Reset";
        case LiveOpsDailyBonusType.SkipToResetCurrentWeek:
            return "Skip to Reset (Current Week)";
        default:
            return "Unknown";
    }
};

// Mock formatter function
const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Available";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

const DailyBonusPage: React.FC = () => {
    const [dailyBonuses, setDailyBonuses] = useState<SmartObjectsDailyBonusInfo[]>([]);
    const [selectedBonus, setSelectedBonus] = useState<SmartObjectsDailyBonusInfo | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        // Fetch Daily Bonuses when component mounts
        if (Balancy.Main.isReadyToUse) {
            const profile = Balancy.Profiles.system;
            if (profile) {
                const liveOps = profile.liveOpsInfo;
                setDailyBonuses(liveOps.dailyBonusInfos.toArray());
                if (liveOps.dailyBonusInfos.count > 0) {
                    setSelectedBonus(liveOps.dailyBonusInfos.get(0)); // Select the first bonus by default
                }
            }
        }

        // Subscribe to updates
        const updateCallback = () => setDailyBonuses(Balancy.Profiles.system?.liveOpsInfo.dailyBonusInfos.toArray() ?? []);
        let callbackId = Balancy.Callbacks.onDailyBonusUpdated.subscribe(updateCallback);

        return () => Balancy.Callbacks.onDailyBonusUpdated.unsubscribe(callbackId);
    }, []);

    const refresh = () => {
        if (!Balancy.Main.isReadyToUse) {
            console.warn("Balancy is not ready to use.");
            return;
        }

        setRefreshKey((prev) => prev + 1);
    };

    const handleBonusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const bonus = dailyBonuses.find((b) => b.dailyBonus?.name === event.target.value);
        setSelectedBonus(bonus || null);
    };

    const claimReward = () => {
        if (selectedBonus) {
            const result = selectedBonus.claimNextReward();
            console.log("Claimed reward:", result);
            refresh();
        }
    };

    const nextTime = selectedBonus ? selectedBonus.getSecondsTillTheNextReward() : 0;
    const isNextRewardBonus = selectedBonus?.isNextRewardBonus() ?? false;
    const canClaim = selectedBonus?.canClaimNextReward() ?? false;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "24px",
                // background: "linear-gradient(to bottom, black, #1a1a1a)",
                color: "white",
                minHeight: "100vh",
            }}
        >
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px", color: "black" }}>Daily Bonus Panel</h2>

            {/* Daily Bonus Selector */}
            <select
                style={{
                    marginBottom: "16px",
                    padding: "8px",
                    color: "black",
                    borderRadius: "6px",
                    backgroundColor: "white",
                }}
                onChange={handleBonusChange}
                value={selectedBonus?.dailyBonus?.name || ""}
            >
                {dailyBonuses.map((bonus) => (
                    <option key={bonus.dailyBonus?.name} value={bonus.dailyBonus?.name}>
                        {bonus.dailyBonus?.name}
                    </option>
                ))}
            </select>

            {/* Daily Bonus Details (Horizontal Layout) */}
            {selectedBonus && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        backgroundColor: "#2d3748",
                        padding: "16px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        width: "100%",
                        maxWidth: "800px",
                        textAlign: "center",
                    }}
                >
                    {/* Type */}
                    <p style={{ fontSize: "1.125rem" }}>
                        Type: <strong>{getDailyBonusTypeString(selectedBonus.dailyBonus?.type ?? 0)}</strong>
                    </p>

                    {/* Next Reward Time */}
                    <p style={{ fontSize: "1.125rem" }}>
                        Next: <strong>{formatTime(nextTime)}</strong>
                    </p>

                    {/* Bonus Reward */}
                    {selectedBonus.dailyBonus?.bonusReward?.items.length ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ fontSize: "1.125rem" }}>
                                <p style={{ margin: "0 0 4px 0" }}>Bonus Reward:</p>
                                {selectedBonus.dailyBonus.bonusReward.items.map((item, itemIndex) => (
                                    <p key={itemIndex} style={{ margin: "2px 0" }}>
                                        <strong>
                                            {item?.item?.name.value ?? "Unknown"}
                                            {" x"}
                                            {item?.count ?? 0}
                                        </strong>
                                    </p>
                                ))}
                            </div>
                            {isNextRewardBonus && <button
                                style={{
                                    padding: "4px 12px",
                                    backgroundColor: canClaim ? "#ecc94b" : "#e78484",
                                    color: "black",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                                onClick={claimReward}
                            >
                                {canClaim ? "Claim" : "Locked"}
                            </button>}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Reward Grid (7 per row) */}
            {selectedBonus && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "16px",
                        marginTop: "24px",
                    }}
                >
                    {selectedBonus.dailyBonus?.rewards.map((reward, index) => {
                        const rewardNumber = index + 1;
                        const isClaimed = rewardNumber < selectedBonus.getNextRewardNumber();
                        const canClaim = rewardNumber === selectedBonus.getNextRewardNumber() && selectedBonus.canClaimNextReward();
                        const btnColor = isClaimed ? "#828181" : canClaim ? "#ecc94b" : "#e78484";

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: "16px",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                    backgroundColor: isClaimed ? "#4a5568" : canClaim ? "#48bb78" : "#2d3748",
                                }}
                            >
                                <p style={{ fontSize: "0.875rem", fontWeight: "bold", marginBottom: "8px" }}>
                                    Day {rewardNumber}
                                </p>
                                <div style={{ marginBottom: "8px" }}>
                                    {reward?.items && reward.items.length > 0 ? (
                                        reward.items.map((item, itemIndex) => (
                                            <p key={itemIndex} style={{ fontSize: "0.875rem", margin: "2px 0" }}>
                                                {item?.item?.name.value} x{item?.count}
                                            </p>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: "0.875rem" }}>No items</p>
                                    )}
                                </div>
                                <button
                                    style={{
                                        marginTop: "auto",
                                        padding: "4px 12px",
                                        backgroundColor: btnColor,
                                        color: "black",
                                        borderRadius: "6px",
                                        border: "none",
                                        cursor: "pointer",
                                        width: "80px",
                                    }}
                                    disabled={!canClaim}
                                    onClick={claimReward}
                                >
                                    {isClaimed ? "Claimed" : canClaim ? "Collect" : "Locked"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DailyBonusPage;
