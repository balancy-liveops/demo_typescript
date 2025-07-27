import React, { useState, useEffect } from "react";
import {SmartObjectsGameEvent, LiveOpsBattlePassGameEvent, Balancy, SmartObjectsBattlePassRewardStatus, LiveOpsBattlePassRewardLine} from "@balancy/core";
import { TimeFormatter } from "../TimeFormatter";

interface EventViewProps {
    gameEvent: SmartObjectsGameEvent;
    isActive: boolean;
}

const RewardLineTitle: React.FC<{ available: boolean, rewardLine: any }> = ({ available, rewardLine }) => {
    const [accessItemIconUrl, setAccessItemIconUrl] = useState<string | null>(null);

    useEffect(() => {
        if (rewardLine?.accessItem?.icon) {
            rewardLine.accessItem.icon.loadSprite((url: string | null) => {
                setAccessItemIconUrl(url);
            });
        }
    }, [available, rewardLine]);

    return (
        <div style={styles.rewardLineTitleContainer}>
            <div style={styles.rewardLineTitleContent}>
                <span style={styles.rewardLineTitleText}>
                    {rewardLine.name?.value || 'Unknown Reward Line'}
                </span>
                {rewardLine.accessItem && (
                    <div style={styles.accessItemContainer}>
                        {accessItemIconUrl && (
                            <img
                                src={accessItemIconUrl}
                                alt="Access Item Icon"
                                style={styles.accessItemIcon}
                            />
                        )}
                        {available && (
                            <span style={styles.checkmark}>✓</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const RewardCell: React.FC<{ reward: any; myProgress?: any; scoreIndex: number }> = ({ reward, myProgress, scoreIndex }) => {
    const [itemIconUrl, setItemIconUrl] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [renderKey, setRenderKey] = useState(0); // Add state to trigger rerenders

    useEffect(() => {
        if (reward?.item?.icon) {
            reward.item.icon.loadSprite((url: string | null) => {
                setItemIconUrl(url);
            });
        }
    }, [reward]);

    if (!reward) {
        return (
            <div style={styles.rewardCell}>
                <div style={styles.emptyCell}>-</div>
            </div>
        );
    }

    const renderButton = () => {
        const status = myProgress?.getRewardStatus(scoreIndex);

        if (status == undefined || status === SmartObjectsBattlePassRewardStatus.NotAvailable) {
            return null; // Hide button
        }

        if (status === SmartObjectsBattlePassRewardStatus.Claimed) {
            return (
                <button
                    style={{
                        ...styles.claimButton,
                        backgroundColor: '#9e9e9e',
                        cursor: 'not-allowed'
                    }}
                    disabled
                >
                    Claimed
                </button>
            );
        }

        const claimAction = () => {
            const claimResult = myProgress.claimReward(scoreIndex);
            console.log("Claiming reward:", claimResult);

            if (claimResult) {
                // Trigger rerender by updating the render key
                setRenderKey(prev => prev + 1);
            }
        };

        return (
            <button
                style={{
                    ...styles.claimButton,
                    backgroundColor: isHovered ? '#45a049' : '#4CAF50'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={claimAction}
            >
                Claim
            </button>
        );
    };

    return (
        <div style={styles.rewardCell}>
            <div style={styles.itemName}>{reward.item?.name?.value || 'Unknown Item'}</div>
            {itemIconUrl && (
                <img
                    src={itemIconUrl}
                    alt="Item Icon"
                    style={styles.itemIcon}
                />
            )}
            <div style={styles.itemCount}>{reward.count || 0}</div>
            {renderButton()}
        </div>
    );
};

const BattlePassView: React.FC<{ battlePassEvent: LiveOpsBattlePassGameEvent; isActive: boolean }> = ({ battlePassEvent, isActive }) => {
    const [eventIconUrl, setEventIconUrl] = useState<string | null>(null);
    const config = battlePassEvent.config;

    if (!config) {
        return <div>Battle Pass config not found</div>;
    }

    useEffect(() => {
        // Load event icon
        if (battlePassEvent.icon) {
            battlePassEvent.icon.loadSprite((url: string | null) => {
                setEventIconUrl(url);
            });
        }
    }, [battlePassEvent]);

    const timeText = isActive
        ? TimeFormatter.formatUnixTime(battlePassEvent.getSecondsLeftBeforeDeactivation())
        : TimeFormatter.formatUnixTime(battlePassEvent.getSecondsBeforeActivation());

    const scores = config.scores || [];
    const rewardLines = config.rewards || [];

    // Calculate levels (starting from 1)
    const levels = scores.map((_, index) => index + 1);

    if (!Balancy.Profiles?.system?.battlePassesInfo)
        return null;

    const battlePassInfo = Balancy.Profiles?.system?.battlePassesInfo.findBattlePassInfo(battlePassEvent);

    const currentLevel = battlePassInfo ? battlePassInfo.level : -1;
    const currentPlayerScore = battlePassInfo ? battlePassInfo.scores : -1;
    const targetScores = scores.length > currentLevel ? scores[currentLevel] : 0;

    return (
        <div style={styles.battlePassContainer}>
            <div style={styles.battlePassHeader}>
                <div style={styles.battlePassHeaderLeft}>
                    {eventIconUrl && (
                        <img
                            src={eventIconUrl}
                            alt="Event Icon"
                            style={styles.eventIcon}
                        />
                    )}
                    <span style={styles.name}>{battlePassEvent.name?.value || 'Unknown Event'}</span>
                </div>
                <span style={styles.time}>{timeText}</span>
            </div>

            <div style={styles.battlePassContent}>
                <div style={styles.battlePassScrollContainer}>
                    {/* Current Score Display */}
                    <div style={styles.currentScoreDisplay}>
                        <span style={styles.currentLevelText}>Level: {currentLevel}</span>
                        <span style={styles.currentScoreText}>Scores: {currentPlayerScore} / {targetScores}</span>
                    </div>

                    {/* Level indicators at the top */}
                    <div style={styles.levelIndicators}>
                        {levels.map((level, index) => {
                            const isAchieved = level <= currentLevel;
                            return (
                                <div key={index} style={{
                                    ...styles.levelCircle,
                                    backgroundColor: isAchieved ? '#2196F3' : '#9e9e9e'
                                }}>
                                    <span style={styles.levelNumber}>{level}</span>
                                    <div style={styles.levelScore}>{scores[index] || 0}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Reward Lines */}
                    {rewardLines.map((rewardLine, lineIndex) => {
                        if (!rewardLine) return null;
                        const myProgress = battlePassInfo?.progressInfo.get(lineIndex);

                        return (
                            <div key={lineIndex} style={styles.rewardLine}>
                                <RewardLineTitle available={myProgress?.available ?? false} rewardLine={rewardLine} />
                                <div style={styles.rewardItems}>
                                    {scores.map((score, scoreIndex) => {
                                        const rewards = rewardLine.rewards || [];
                                        const reward = rewards[scoreIndex];
                                        return (
                                            <RewardCell key={scoreIndex} reward={reward} myProgress={myProgress} scoreIndex={scoreIndex} />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const EventView: React.FC<EventViewProps> = ({ gameEvent, isActive }) => {
    // Check if this is a BattlePass event
    if (gameEvent instanceof LiveOpsBattlePassGameEvent) {
        return <BattlePassView battlePassEvent={gameEvent} isActive={isActive} />;
    }

    // Regular event view
    const timeText = isActive
        ? TimeFormatter.formatUnixTime(gameEvent.getSecondsLeftBeforeDeactivation())
        : TimeFormatter.formatUnixTime(gameEvent.getSecondsBeforeActivation());

    return (
        <div style={styles.container}>
            <span style={styles.name}>{gameEvent.name?.value || 'Unknown Event'}</span>
            <span style={styles.time}>{timeText}</span>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "10px",
    },
    name: {
        fontWeight: "bold",
        fontSize: "16px",
        flex: 1,
    },
    time: {
        fontSize: "14px",
        color: "#555",
        textAlign: "right",
        marginLeft: "10px",
    },
    // BattlePass styles
    battlePassContainer: {
        border: "2px solid #4CAF50",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "15px",
        backgroundColor: "#f9f9f9",
    },
    battlePassHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
        borderBottom: "1px solid #ddd",
        paddingBottom: "10px",
    },
    battlePassHeaderLeft: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    eventIcon: {
        width: "32px",
        height: "32px",
        objectFit: "contain",
    },
    battlePassContent: {
        position: "relative",
        overflowX: "auto",
        overflowY: "hidden",
    },
    battlePassScrollContainer: {
        display: "flex",
        flexDirection: "column",
        minWidth: "max-content",
    },
    levelIndicators: {
        display: "flex",
        gap: "10px",
        marginLeft: "135px", // Align with reward items
        marginBottom: "15px",
    },
    currentScoreDisplay: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginLeft: "135px", // Align with reward items
        marginBottom: "10px",
        padding: "8px 12px",
        backgroundColor: "#f0f0f0",
        borderRadius: "8px",
        border: "1px solid #ddd",
    },
    currentScoreText: {
        fontSize: "14px",
        fontWeight: "bold",
        color: "#333",
    },
    currentLevelText: {
        fontSize: "14px",
        fontWeight: "bold",
        color: "#2196F3",
    },
    levelCircle: {
        width: "82px",
        height: "50px",
        borderRadius: "25px",
        backgroundColor: "#2196F3",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
    },
    levelNumber: {
        fontSize: "14px",
        fontWeight: "bold",
    },
    levelScore: {
        fontSize: "10px",
        opacity: 0.8,
    },
    rewardLine: {
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
    },
    rewardLineTitle: {
        minWidth: "120px",
        fontWeight: "bold",
        fontSize: "14px",
        marginRight: "15px",
        color: "#333",
    },
    rewardLineTitleContainer: {
        minWidth: "120px",
        marginRight: "15px",
    },
    rewardLineTitleContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4px",
    },
    rewardLineTitleText: {
        fontWeight: "bold",
        fontSize: "14px",
        color: "#333",
    },
    accessItemContainer: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "2px",
    },
    accessItemIcon: {
        width: "50px",
        height: "50px",
        objectFit: "contain",
    },
    checkmark: {
        fontSize: "50px",
        color: "#4CAF50",
        fontWeight: "bold",
    },
    rewardItems: {
        display: "flex",
        gap: "10px",
    },
    rewardCell: {
        border: "1px solid #ddd",
        borderRadius: "5px",
        // padding: "8px",
        width: "80px",
        height: "120px", // Увеличиваем высоту для кнопки
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        position: "relative",
    },
    itemName: {
        fontSize: "10px",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "2px",
        color: "#333",
        order: 1,
        position: "absolute",
        top: "2px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "1px 3px",
        borderRadius: "3px",
        zIndex: 2,
        width: "calc(100% - 6px)",
        boxSizing: "border-box",
    },
    itemIcon: {
        width: "80%",
        height: "80%",
        objectFit: "contain",
        order: 2,
        margin: "2px 0",
    },
    itemCount: {
        fontSize: "11px",
        color: "#333",
        textAlign: "center",
        order: 3,
        position: "absolute",
        bottom: "32px", // Поднимаем над кнопкой
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "1px 4px",
        borderRadius: "3px",
        zIndex: 2,
        fontWeight: "bold",
    },
    emptyCell: {
        color: "#999",
        fontSize: "14px",
    },
    claimButton: {
        position: "absolute",
        bottom: "4px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "4px 8px",
        fontSize: "10px",
        fontWeight: "bold",
        cursor: "pointer",
        width: "calc(100% - 8px)",
        boxSizing: "border-box",
        zIndex: 3,
        order: 4,
    },
};

export default EventView;
