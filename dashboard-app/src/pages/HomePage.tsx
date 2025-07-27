import React, { useState, useEffect } from 'react';
import { Balancy, Environment } from '@balancy/core';
import { BalancyConfigParams } from '../balancyLoader';

interface HomePageProps {
    config: BalancyConfigParams;
    onDisconnect: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ config, onDisconnect }) => {
    const [gameInfo, setGameInfo] = useState<any>(null);

    // useEffect(() => {
    //     // Fetch game information from Balancy when available
    //     if (Balancy && Balancy.Game) {
    //         try {
    //             // This is a placeholder - update with actual Balancy API calls
    //             // to get the game information you want to display
    //             const info = {
    //                 name: Balancy.Game.name || 'Game Information',
    //                 version: Balancy.Game.version || '1.0.0',
    //                 // Add other properties you want to display
    //             };
    //             setGameInfo(info);
    //         } catch (error) {
    //             console.error('Error fetching game info:', error);
    //         }
    //     }
    // }, [config]);

    // Helper function to get environment name for display
    const getEnvironmentName = (env: Environment): string => {
        switch (env) {
            case Environment.Production:
                return 'Production';
            case Environment.Stage:
                return 'Stage';
            default:
                return 'Development';
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Balancy Game Dashboard</h1>

            <div style={styles.gameInfoCard}>
                <h2 style={styles.gameInfoTitle}>Connected Game Configuration</h2>
                <div style={styles.gameInfoContent}>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Game ID:</span>
                        <span style={styles.infoValue}>{config.apiGameId}</span>
                    </div>

                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Environment:</span>
                        <span style={styles.infoValue}>
                            <span style={styles.environmentBadge}>
                                {getEnvironmentName(config.environment)}
                            </span>
                        </span>
                    </div>

                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Device ID:</span>
                        <span style={styles.infoValue}>{config.deviceId}</span>
                    </div>

                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>App Version:</span>
                        <span style={styles.infoValue}>{config.appVersion}</span>
                    </div>

                    {gameInfo && (
                        <>
                            <div style={styles.sectionDivider}></div>
                            <h3 style={styles.sectionTitle}>Game Information</h3>

                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Name:</span>
                                <span style={styles.infoValue}>{gameInfo.name}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Version:</span>
                                <span style={styles.infoValue}>{gameInfo.version}</span>
                            </div>
                            {/* Add more game info rows as needed */}
                        </>
                    )}
                </div>

                <div style={styles.actionsContainer}>
                    <button
                        onClick={onDisconnect}
                        style={styles.disconnectButton}
                    >
                        Disconnect from Game
                    </button>
                </div>
            </div>

            <div style={styles.instructionsCard}>
                <h2 style={styles.instructionsTitle}>Getting Started</h2>
                <p style={styles.instructionsText}>
                    You're now connected to your Balancy game in the <strong>{getEnvironmentName(config.environment)}</strong> environment.
                    Use the navigation links above to explore different aspects of your game's configuration.
                </p>
                <ul style={styles.instructionsList}>
                    <li>View general information about your game in the <strong>Info</strong> section</li>
                    <li>Manage A/B tests and segmentation rules</li>
                    <li>Configure ads, game events, and offers</li>
                    <li>Set up shop items and inventory management</li>
                    <li>Adjust user properties and languages</li>
                    <li>Test time-based events and daily bonuses</li>
                </ul>

                <div style={styles.tipBox}>
                    <h4 style={styles.tipTitle}>Tip:</h4>
                    <p>You can bookmark this page with your current configuration or share the URL to quickly connect with the same settings.</p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#333',
    },
    gameInfoCard: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
    },
    gameInfoTitle: {
        fontSize: '20px',
        marginTop: '0',
        marginBottom: '15px',
        color: '#333',
    },
    gameInfoContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    infoRow: {
        display: 'flex',
        borderBottom: '1px solid #eee',
        paddingBottom: '8px',
    },
    infoLabel: {
        width: '120px',
        fontWeight: 'bold',
        color: '#555',
    },
    infoValue: {
        flex: '1',
    },
    environmentBadge: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    sectionDivider: {
        height: '1px',
        backgroundColor: '#ddd',
        margin: '15px 0',
    },
    sectionTitle: {
        fontSize: '16px',
        marginTop: '5px',
        marginBottom: '10px',
        color: '#333',
    },
    actionsContainer: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    disconnectButton: {
        backgroundColor: '#f0ad4e',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
    },
    instructionsCard: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
    },
    instructionsTitle: {
        fontSize: '20px',
        marginTop: '0',
        marginBottom: '15px',
        color: '#333',
    },
    instructionsText: {
        lineHeight: '1.5',
        marginBottom: '15px',
    },
    instructionsList: {
        paddingLeft: '20px',
        margin: '0',
        lineHeight: '1.6',
        marginBottom: '20px',
    },
    tipBox: {
        backgroundColor: '#e8f4fd',
        border: '1px solid #b8daff',
        borderRadius: '4px',
        padding: '12px 15px',
        marginTop: '10px',
    },
    tipTitle: {
        margin: '0 0 5px 0',
        color: '#004085',
    }
};

export default HomePage;
