import React, { useState, useEffect } from 'react';
import { Environment } from '@balancy/core';
import { BalancyConfigParams } from '../balancyLoader';

interface ConnectPageProps {
    onConnect: (config: BalancyConfigParams) => void;
}

const ConnectPage: React.FC<ConnectPageProps> = ({ onConnect }) => {
    const [config, setConfig] = useState<BalancyConfigParams>({
        apiGameId: '',
        publicKey: '',
        environment: Environment.Development,
        deviceId: '',
        appVersion: '1.0.0'
    });

    // Basic form validation
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        // Check for game_id and other parameters in URL
        const queryParams = new URLSearchParams(window.location.search);
        const urlGameId = queryParams.get('game_id');
        const urlPublicKey = queryParams.get('public_key');
        const urlEnvironment = queryParams.get('environment');
        const urlDeviceId = queryParams.get('device_id');
        const urlAppVersion = queryParams.get('app_version');

        // Update config with URL parameters if available
        const updatedConfig = { ...config };
        let updateNeeded = false;

        if (urlGameId) {
            updatedConfig.apiGameId = urlGameId;
            updateNeeded = true;
        }

        if (urlPublicKey) {
            updatedConfig.publicKey = urlPublicKey;
            updateNeeded = true;
        }

        if (urlEnvironment) {
            const env = parseEnvironment(urlEnvironment);
            if (env !== null) {
                updatedConfig.environment = env;
                updateNeeded = true;
            }
        }

        if (urlDeviceId) {
            updatedConfig.deviceId = urlDeviceId;
            updateNeeded = true;
        }

        if (urlAppVersion) {
            updatedConfig.appVersion = urlAppVersion;
            updateNeeded = true;
        }

        if (updateNeeded) {
            setConfig(updatedConfig);
        }

        // Retrieve device ID from localStorage if available
        const storedDeviceId = localStorage.getItem('balancy_device_id');
        if (storedDeviceId && !updatedConfig.deviceId) {
            setConfig(prev => ({
                ...prev,
                deviceId: storedDeviceId
            }));
        }
    }, []);

    // Check if required fields are filled
    useEffect(() => {
        setIsValid(!!config.apiGameId && !!config.publicKey);
    }, [config]);

    const handleConnect = () => {
        if (isValid) {
            onConnect(config);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: name === 'environment' ? parseEnvironment(value) : value
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && isValid) {
            handleConnect();
        }
    };

    // Helper function to parse environment string to enum
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

    // Helper function to convert Environment enum to string
    const environmentToString = (env: Environment): string => {
        switch (env) {
            case Environment.Production:
                return 'Production';
            case Environment.Stage:
                return 'Stage';
            default:
                return 'Development';
        }
    };

    // Generate a new device ID
    const generateNewDeviceId = () => {
        const newDeviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        setConfig(prev => ({
            ...prev,
            deviceId: newDeviceId
        }));
    };

    return (
        <div style={styles.connectContainer}>
            <h1 style={styles.title}>Welcome to Balancy Demo</h1>
            <p style={styles.subtitle}>Configure Balancy settings to connect</p>

            <div style={styles.connectForm}>
                <div style={styles.inputGroup}>
                    <label htmlFor="apiGameId" style={styles.label}>Game ID: *</label>
                    <input
                        type="text"
                        id="apiGameId"
                        name="apiGameId"
                        value={config.apiGameId}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter Game ID"
                        style={styles.input}
                        required
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="publicKey" style={styles.label}>Public Key: *</label>
                    <input
                        type="text"
                        id="publicKey"
                        name="publicKey"
                        value={config.publicKey}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter Public Key"
                        style={styles.input}
                        required
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="environment" style={styles.label}>Environment:</label>
                    <select
                        id="environment"
                        name="environment"
                        value={environmentToString(config.environment)}
                        onChange={handleInputChange}
                        style={styles.select}
                    >
                        <option value="Development">Development</option>
                        <option value="Stage">Stage</option>
                        <option value="Production">Production</option>
                    </select>
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="deviceId" style={styles.label}>Device ID:</label>
                    <div style={styles.deviceIdContainer}>
                        <input
                            type="text"
                            id="deviceId"
                            name="deviceId"
                            value={config.deviceId}
                            onChange={handleInputChange}
                            placeholder="Auto-generated if empty"
                            style={styles.deviceIdInput}
                        />
                        <button
                            onClick={generateNewDeviceId}
                            style={styles.generateButton}
                            type="button"
                        >
                            Generate
                        </button>
                    </div>
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="appVersion" style={styles.label}>App Version:</label>
                    <input
                        type="text"
                        id="appVersion"
                        name="appVersion"
                        value={config.appVersion}
                        onChange={handleInputChange}
                        placeholder="1.0.0"
                        style={styles.input}
                    />
                </div>

                <button
                    onClick={handleConnect}
                    disabled={!isValid}
                    style={{
                        ...styles.connectButton,
                        ...(isValid ? {} : styles.disabledButton)
                    }}
                >
                    Connect
                </button>
            </div>

            <div style={styles.instructions}>
                <h3 style={styles.instructionTitle}>Instructions:</h3>
                <ol style={styles.instructionList}>
                    <li>Enter the required Game ID and Public Key</li>
                    <li>Optionally configure environment, device ID, and app version</li>
                    <li>Click "Connect" to initialize Balancy</li>
                </ol>
                <p style={styles.requiredNote}>* Required fields</p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    connectContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '20px',
    },
    title: {
        fontSize: '32px',
        marginBottom: '10px',
        color: '#333',
    },
    subtitle: {
        fontSize: '18px',
        marginBottom: '30px',
        color: '#666',
    },
    connectForm: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '500px',
        gap: '20px',
        marginBottom: '30px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'left',
    },
    input: {
        padding: '12px 16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px',
    },
    select: {
        padding: '12px 16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px',
        backgroundColor: '#fff',
    },
    deviceIdContainer: {
        display: 'flex',
        gap: '10px',
    },
    deviceIdInput: {
        padding: '12px 16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px',
        flex: 1,
    },
    generateButton: {
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '0 15px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    connectButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '12px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        marginTop: '10px',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
    },
    instructions: {
        textAlign: 'left',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
    },
    instructionTitle: {
        marginTop: '0',
        marginBottom: '10px',
        fontSize: '18px',
    },
    instructionList: {
        paddingLeft: '20px',
        margin: '0',
        marginBottom: '15px',
    },
    requiredNote: {
        fontSize: '14px',
        color: '#666',
        marginTop: '0',
    },
};

export default ConnectPage;
