import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ConnectPage from './pages/ConnectPage';
import { initializeBalancy, BalancyConfigParams } from './balancyLoader';
import GeneralInfoPage from "./pages/GeneralInfoPage";
import ABTestsPage from "./pages/ABTestsPage";
import SegmentationPage from "./pages/SegmentationPage";
import AdsPage from "./pages/AdsPage";
import GameEventsPage from "./pages/GameEventsPage";
import InventoryPage from "./pages/InventoryPage";
import GameOffersPage from "./pages/GameOffersPage";
import { Balancy, Environment } from '@balancy/core';
import ShopPage from "./pages/ShopPage";
import UserPropertiesPage from "./pages/UserPropertiesPage";
import LanguagesPage from "./pages/LanguagesPage";
import TimeCheatPage from "./pages/TimeCheatPage";
import DailyBonusPage from "./pages/DailyBonusPage";
import BalancyStatus from "./pages/BalancyStatus";

const App: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [currentConfig, setCurrentConfig] = useState<BalancyConfigParams | null>(null);
    const initializedRef = React.useRef(false);

    useEffect(() => {
        // Check for configuration parameters in URL on initial load
        const queryParams = new URLSearchParams(window.location.search);
        const urlGameId = queryParams.get('game_id');

        if (urlGameId) {
            // If game_id is in URL, attempt auto-connect
            // The full config will be built in the ConnectPage component
            addKeyframes();
        } else {
            // Just add keyframes if no auto-connect
            addKeyframes();
        }
    }, []);

    const connectToBalancy = async (config: BalancyConfigParams) => {
        if (!config.apiGameId || !config.publicKey) return;

        setLoading(true);

        try {
            // Pass config to initialization function
            await initializeBalancy(config);
            setIsConnected(true);
            setCurrentConfig(config);

            // Update URL with game_id for easy sharing/bookmarking
            const url = new URL(window.location.href);
            url.searchParams.set('game_id', config.apiGameId);
            window.history.replaceState({}, '', url.toString());
        } catch (error) {
            console.error('Error initializing Balancy:', error);
            alert('Failed to connect to Balancy. Please check your configuration and try again.');
        } finally {
            setLoading(false);
        }
    };

    const disconnectFromBalancy = () => {
        // Handle disconnection
        Balancy.Profiles.reset();
        setIsConnected(false);
        setCurrentConfig(null);

        // Remove game_id from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('game_id');
        url.searchParams.delete('public_key');
        url.searchParams.delete('environment');
        url.searchParams.delete('device_id');
        url.searchParams.delete('app_version');
        window.history.replaceState({}, document.title, url.toString());
    };

    const handleReset = () => {
        Balancy.Profiles.reset();
    };

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

    if (loading) {
        return (
            <div style={styles.loaderContainer}>
                <div style={styles.loader}></div>
                <p>Connecting to Balancy...</p>
                {currentConfig && (
                    <p style={styles.loadingInfo}>Game ID: {currentConfig.apiGameId}</p>
                )}
            </div>
        );
    }

    return (
        <Router>
            <div>
                {isConnected && currentConfig ? (
                    // Connected state UI
                    <>
                        <nav style={styles.nav}>
                            <div style={styles.navLeft}>
                                <Link to="/" style={styles.tab}>Home</Link>
                                <Link to="/info" style={styles.tab}>Info</Link>
                                <Link to="/ab-tests" style={styles.tab}>AB Tests</Link>
                                <Link to="/segmentation" style={styles.tab}>Segmentation</Link>
                                <Link to="/ads" style={styles.tab}>Ads</Link>
                                <Link to="/game-events" style={styles.tab}>Game Events</Link>
                                <Link to="/offers" style={styles.tab}>Offers</Link>
                                <Link to="/shop" style={styles.tab}>Shop</Link>
                                <Link to="/inventory" style={styles.tab}>Inventory</Link>
                                <Link to="/daily-bonus" style={styles.tab}>Daily Bonus</Link>
                                <Link to="/user-properties" style={styles.tab}>User Properties</Link>
                                <Link to="/languages" style={styles.tab}>Languages</Link>
                                <Link to="/time" style={styles.tab}>Time</Link>
                            </div>
                            <div style={styles.navRight}>
                                <span style={styles.configBadge}>
                                    {getEnvironmentName(currentConfig.environment)}
                                </span>
                                <button style={styles.disconnectButton} onClick={disconnectFromBalancy}>Disconnect</button>
                                <button style={styles.resetButton} onClick={handleReset}>Reset</button>
                            </div>
                        </nav>

                        <BalancyStatus />

                        <div style={styles.content}>
                            <Routes>
                                <Route path="/" element={<HomePage config={currentConfig} onDisconnect={disconnectFromBalancy} />} />
                                <Route path="/info" element={<GeneralInfoPage />} />
                                <Route path="/ab-tests" element={<ABTestsPage />} />
                                <Route path="/segmentation" element={<SegmentationPage />} />
                                <Route path="/ads" element={<AdsPage />} />
                                <Route path="/game-events" element={<GameEventsPage />} />
                                <Route path="/offers" element={<GameOffersPage />} />
                                <Route path="/shop" element={<ShopPage />} />
                                <Route path="/inventory" element={<InventoryPage />} />
                                <Route path="/daily-bonus" element={<DailyBonusPage />} />
                                <Route path="/user-properties" element={<UserPropertiesPage />} />
                                <Route path="/languages" element={<LanguagesPage />} />
                                <Route path="/time" element={<TimeCheatPage />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </>
                ) : (
                    // Disconnected state UI - only show connection page
                    <div style={styles.content}>
                        <Routes>
                            <Route path="*" element={<ConnectPage onConnect={connectToBalancy} />} />
                        </Routes>
                    </div>
                )}
            </div>
        </Router>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: '10px',
    },
    navLeft: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    configBadge: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    tab: {
        margin: '0 10px',
        textDecoration: 'none',
        color: '#007bff',
        fontWeight: 'bold',
    },
    resetButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
    },
    disconnectButton: {
        backgroundColor: '#f0ad4e',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
    },
    content: {
        padding: '20px',
        textAlign: 'center',
    },
    loaderContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    loader: {
        width: '50px',
        height: '50px',
        border: '5px solid #ccc',
        borderTop: '5px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingInfo: {
        marginTop: '10px',
        color: '#666',
    },
};

function addKeyframes() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

export default App;
