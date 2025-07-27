import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeBalancy, BalancyConfigParams } from './balancyLoader';
import { Environment } from '@balancy/core';
import ConnectPage from './pages/ConnectPage';
import DashboardMode from './components/DashboardMode';
import ReactAppMode from './components/ReactAppMode';

const STORAGE_KEY = 'balancy_connection_info';
const RENDER_MODE_KEY = 'balancy_render_mode';

export type RenderMode = 'dashboard' | 'react-app';

const App: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [currentConfig, setCurrentConfig] = useState<BalancyConfigParams | null>(null);
    const [renderMode, setRenderMode] = useState<RenderMode>('dashboard');
    const initializedRef = React.useRef(false);

    // Load render mode from localStorage
    useEffect(() => {
        const savedMode = localStorage.getItem(RENDER_MODE_KEY);
        if (savedMode === 'dashboard' || savedMode === 'react-app') {
            setRenderMode(savedMode);
        }
    }, []);

    // Save render mode to localStorage
    const toggleRenderMode = () => {
        const newMode: RenderMode = renderMode === 'dashboard' ? 'react-app' : 'dashboard';
        setRenderMode(newMode);
        localStorage.setItem(RENDER_MODE_KEY, newMode);
    };

    // Function to update URL with config params without navigation
    const updateUrlWithConfig = (config: BalancyConfigParams) => {
        const url = new URL(window.location.href);

        // Add all config parameters to URL
        url.searchParams.set('game_id', config.apiGameId);
        url.searchParams.set('public_key', config.publicKey);
        url.searchParams.set('environment', Number(config.environment).toString());

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
        if (!isNaN(Number(value)))
            return Number(value) as Environment;

        switch (value.toLowerCase()) {
            case 'production':
                return Environment.Production;
            case 'stage':
                return Environment.Stage;
            default:
                return Environment.Development;
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
        setIsConnected(false);
        setCurrentConfig(null);

        // Remove stored connection info
        localStorage.removeItem(STORAGE_KEY);

        // Remove params from URL
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
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
            <Router>
                <div style={styles.content}>
                    <Routes>
                        <Route path="*" element={<ConnectPage onConnect={connectToBalancy} />} />
                    </Routes>
                </div>
            </Router>
        );
    }

    // Render the appropriate mode
    if (renderMode === 'dashboard') {
        return (
            <DashboardMode 
                currentConfig={currentConfig!}
                onToggleRenderMode={toggleRenderMode}
                onDisconnect={disconnectFromBalancy}
            />
        );
    }

    return (
        <ReactAppMode 
            currentConfig={currentConfig!}
            onToggleRenderMode={toggleRenderMode}
            onDisconnect={disconnectFromBalancy}
        />
    );
};

const styles: { [key: string]: React.CSSProperties } = {
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
    }
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