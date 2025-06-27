import React, { useState, useEffect } from 'react';
import { initializeBalancy, BalancyConfigParams } from './balancyLoader';
import { Balancy, Environment } from '@balancy/core';
import { BalancyMainUI } from './components/BalancyMainUI'; // Import the new component

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

        return {
            apiGameId: urlGameId,
            publicKey: urlPublicKey,
            environment: urlEnvironment ? parseEnvironment(urlEnvironment) : Environment.Development,
            deviceId: urlDeviceId || undefined,
            appVersion: urlAppVersion || '1.0.0'
        };
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

    if (!isConnected) {
        return (
            <div style={styles.content}>
                <h1>Balancy Dashboard</h1>
                <p>Please provide connection parameters in the URL or they will be loaded from localStorage if available.</p>
                <p>Required URL parameters:</p>
                <ul>
                    <li><code>game_id</code> - Your Balancy Game ID</li>
                    <li><code>public_key</code> - Your Balancy Public Key</li>
                    <li><code>environment</code> - development/stage/production (optional, defaults to development)</li>
                    <li><code>device_id</code> - Device ID (optional)</li>
                    <li><code>app_version</code> - App Version (optional, defaults to 1.0.0)</li>
                </ul>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Navigation Bar */}
            <nav style={styles.nav}>
                <div style={styles.navLeft}>
                    {/*<span style={styles.configBadge}>*/}
                    {/*    {getEnvironmentName(currentConfig!.environment)}*/}
                    {/*</span>*/}
                    <span>Game ID: {currentConfig!.apiGameId}</span>
                </div>
                <div style={styles.navRight}>
                    <button style={styles.resetButton} onClick={handleReset}>
                        Reset Profile
                    </button>
                    {/*<button style={styles.disconnectButton} onClick={disconnectFromBalancy}>*/}
                    {/*    Disconnect*/}
                    {/*</button>*/}
                </div>
            </nav>

            {/* Main Content Area */}
            <div style={styles.mainContent}>
                <h1 style={styles.title}>Game Simulation Screen</h1>
                <p style={styles.subtitle}>
                    Active events and offers will appear on the left and right sides of the screen
                </p>

                {/* Simulated game content */}
                <div style={styles.gameContent}>
                    <div style={styles.gameArea}>
                        <h2>🎮 Game Area</h2>
                        <p>This simulates your main game screen.</p>
                        <p>Check the sides for active events and offers!</p>

                        <div style={styles.gameStats}>
                            <div style={styles.stat}>
                                <span>👑 Level</span>
                                <span>42</span>
                            </div>
                            <div style={styles.stat}>
                                <span>💰 Coins</span>
                                <span>15,430</span>
                            </div>
                            <div style={styles.stat}>
                                <span>💎 Gems</span>
                                <span>87</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balancy UI - Events and Offers on sides */}
            <BalancyMainUI />
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        height: '100vh',
        width: '100vw',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        margin: 0,
        padding: 0
    },
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 15, 30, 0.9)',
        padding: '15px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        height: '70px',
        boxSizing: 'border-box'
    },
    navLeft: {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    configBadge: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    resetButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s'
    },
    disconnectButton: {
        backgroundColor: '#f0ad4e',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s'
    },
    mainContent: {
        padding: '20px 140px',
        textAlign: 'center',
        height: 'calc(100vh - 70px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box'
    },
    title: {
        fontSize: '2.2em',
        marginBottom: '10px',
        color: '#3498db'
    },
    subtitle: {
        fontSize: '1.1em',
        color: '#95a5a6',
        marginBottom: '30px'
    },
    gameContent: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    gameArea: {
        backgroundColor: 'rgba(52, 73, 94, 0.3)',
        borderRadius: '20px',
        padding: '40px',
        border: '2px solid rgba(52, 152, 219, 0.3)',
        maxWidth: '500px',
        width: '100%'
    },
    gameStats: {
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: '25px',
        gap: '15px'
    },
    stat: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(44, 62, 80, 0.5)',
        padding: '15px',
        borderRadius: '10px',
        flex: 1
    },
    content: {
        padding: '40px',
        textAlign: 'center',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        overflow: 'hidden',
        margin: 0,
        boxSizing: 'border-box'
    },
    loaderContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        overflow: 'hidden',
        margin: 0,
        padding: 0
    },
    loader: {
        width: '50px',
        height: '50px',
        border: '5px solid #2c3e50',
        borderTop: '5px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingInfo: {
        marginTop: '10px',
        color: '#95a5a6',
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
        html {
            overflow: hidden !important;
            height: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        body {
            overflow: hidden !important;
            height: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
        }
        #root {
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
        }
    `;
    document.head.appendChild(style);
}

export default App;
