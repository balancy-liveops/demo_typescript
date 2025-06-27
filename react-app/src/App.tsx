import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
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

// Storage key for saving connection info
const STORAGE_KEY = 'balancy_connection_info';

const App: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [currentConfig, setCurrentConfig] = useState<BalancyConfigParams | null>(null);
    const initializedRef = React.useRef(false);

    // Function to update URL with config params without navigation
    const updateUrlWithConfig = (config: BalancyConfigParams) => {
        const url = new URL(window.location.href);

        // Add all config parameters to URL
        url.searchParams.set('game_id', config.apiGameId);
        url.searchParams.set('public_key', config.publicKey);
        url.searchParams.set('environment', environmentToString(config.environment));

        if (config.deviceId) {
            url.searchParams.set('device_id', config.deviceId);
        }

        if (config.appVersion) {
            url.searchParams.set('app_version', config.appVersion);
        }

        if (config.branchName) {
            url.searchParams.set('branch_name', config.branchName);
        }

        // Update URL without navigation
        window.history.replaceState({}, '', url.toString());
    };

    // Function to save connection info to localStorage
    const saveConnectionInfo = (config: BalancyConfigParams) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Error saving connection info to localStorage:', error);
        }
    };

    // Function to load connection info from localStorage
    const loadConnectionInfo = (): BalancyConfigParams | null => {
        try {
            const storedInfo = localStorage.getItem(STORAGE_KEY);
            if (!storedInfo) return null;

            const config = JSON.parse(storedInfo) as BalancyConfigParams;

            // Ensure environment is parsed correctly (it might be stored as a number)
            if (typeof config.environment === 'string') {
                config.environment = parseEnvironment(config.environment);
            }

            return config;
        } catch (error) {
            console.error('Error loading connection info from localStorage:', error);
            return null;
        }
    };

    // Helper functions for environment conversion
    const parseEnvironment = (value: string): Environment => {
        switch (value.toLowerCase()) {
            case 'production':
                return Environment.Production;
            case 'stage':
                return Environment.Stage;
            default:
                return Environment.Development;
        }
    };

    const environmentToString = (env: Environment): string => {
        switch (env) {
            case Environment.Production:
                return 'production';
            case Environment.Stage:
                return 'stage';
            default:
                return 'development';
        }
    };

    // Function to extract config from URL parameters
    const getConfigFromUrl = (): BalancyConfigParams | null => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlGameId = queryParams.get('game_id');
        const urlPublicKey = queryParams.get('public_key');

        // Return null if required parameters are missing
        if (!urlGameId || !urlPublicKey) return null;

        const urlEnvironment = queryParams.get('environment');
        const urlDeviceId = queryParams.get('device_id');
        const urlAppVersion = queryParams.get('app_version');
        const urlBranchName = queryParams.get('branch_name');

        return {
            apiGameId: urlGameId,
            publicKey: urlPublicKey,
            environment: urlEnvironment ? parseEnvironment(urlEnvironment) : Environment.Development,
            deviceId: urlDeviceId || undefined,
            appVersion: urlAppVersion || undefined,
            branchName: urlBranchName || undefined
        };
    };

    // Function to handle route changes and ensure URL params persist
    const handleRouteChange = () => {
        // If connected and config exists, ensure URL params are set
        if (isConnected && currentConfig) {
            updateUrlWithConfig(currentConfig);
        }
    };

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        addKeyframes();

        // Check URL parameters first
        const urlConfig = getConfigFromUrl();

        if (urlConfig) {
            // If URL has all required params, connect with them
            connectToBalancy(urlConfig);
        } else {
            // Otherwise try to load from localStorage
            const storedConfig = loadConnectionInfo();

            if (storedConfig) {
                // Update URL with stored config
                updateUrlWithConfig(storedConfig);
                // And connect
                connectToBalancy(storedConfig);
            }
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

            // Save connection info to localStorage
            saveConnectionInfo(config);

            // Update URL with config params
            updateUrlWithConfig(config);
        } catch (error) {
            console.error('Error initializing Balancy:', error);
            alert('Failed to connect to Balancy. Please check your configuration and try again.');
        } finally {
            setLoading(false);
        }
    };

    const disconnectFromBalancy = () => {
        // Handle disconnection
        // Balancy.Profiles.reset();
        Balancy.Main.stop();
        setIsConnected(false);
        setCurrentConfig(null);

        // Remove stored connection info
        localStorage.removeItem(STORAGE_KEY);

        // Remove params from URL
        const url = new URL(window.location.href);
        url.search = '';
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
            <RouteChangeHandler onRouteChange={handleRouteChange} />
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

// Helper component to detect route changes
const RouteChangeHandler: React.FC<{ onRouteChange: () => void }> = ({ onRouteChange }) => {
    const location = useLocation();

    useEffect(() => {
        onRouteChange();
    }, [location, onRouteChange]);

    return null;
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
