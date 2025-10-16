import * as React from 'react';
import {CSSProperties, useEffect, useState} from 'react';
import balancyLogo from '../../assets/images/balancy-logo.png';
import visaLogo from '../../assets/images/visa-logo.png';
import royalLogo from '../../assets/images/royal-logo.png';
import tappingIcon from '../../assets/images/tapping-icon.png';
import IAPEventEmitter, {IAPEvents} from './events';
import Spinner from "../../components/common/Spinner/Spinner";

type IAPViewProps = {
};
export default function IAPView(props: IAPViewProps): JSX.Element | null {
    const [isOpen, setIsOpen] = useState(false);
    const [price, setPrice] = useState('$0.00');
    const [productName, setProductName] = useState('Royal Pass');
    const [productSprite, setProductSprite] = useState<string>()

    useEffect(() => {
        function onOpen(name: string, price: string, sprite?: string) {
            setProductName(name);
            setPrice(price);
            setProductSprite(sprite);
            setIsOpen(true);
        }

        IAPEventEmitter.on(IAPEvents.IAP_OPENED, onOpen);
        return () => {
            IAPEventEmitter.off(IAPEvents.IAP_OPENED, onOpen);
        }
    }, []);

    function handleCloseIAP(event: React.MouseEvent<HTMLElement, MouseEvent>) {
        event.stopPropagation();
        IAPEventEmitter.emit(IAPEvents.IAP_PURCHASED, false);
        setIsOpen(false);
    }

    function handleConfirmIAP(event: React.MouseEvent<HTMLElement, MouseEvent>) {
        event.stopPropagation();
        IAPEventEmitter.emit(IAPEvents.IAP_PURCHASED, true);
        setIsOpen(false);
    }

    if (!isOpen) return null;
    return (
        <>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(0%); }
                    to { transform: translateY(-99%); }
                }
            `}</style>

            <div
                style={styles.container}
                onClick={handleCloseIAP}
            >
                <Spinner size={'2rem'}/>
                <div
                    style={styles.panel}
                    onClick={handleConfirmIAP}
                >
                    <div style={styles.payLogoContainer}>
                        <img
                            src={balancyLogo}
                            alt="Balancy Logo"
                            style={styles.payLogo}
                        />
                        <span style={styles.payLogoText}>Pay</span>
                    </div>
                    <button
                        style={styles.closeButton}
                        onClick={handleCloseIAP}
                    >
                        ×
                    </button>

                    <div style={styles.infoPanelContainer}>
                        <div
                            style={{
                                ...styles.infoPanel,
                                height: '2.5rem',
                                gap: '1rem',
                            }}
                        >
                            <div style={styles.visaLogo}>
                                <img
                                    src={visaLogo}
                                    alt="Visa Logo"
                                    style={{
                                        height: '0.5rem',
                                    }}
                                />
                            </div>

                            <span
                                style={{
                                    width: '100%',
                                }}
                            >
                                Visa Credit
                            </span>

                            <span
                                style={{
                                    width: 'fit-content',
                                    whiteSpace: 'pre'
                                }}
                            >
                                •••• 1234
                            </span>
                        </div>
                    </div>
                    <div style={styles.infoPanelContainer}>
                        <div
                            style={{
                                ...styles.infoPanel,
                                gap: '1rem',
                            }}
                        >
                            <span
                                style={{
                                    width: '100%',
                                }}
                            >
                                Change Payment Method
                            </span>

                            <span
                                style={{
                                    fontSize: '1.5rem'
                                }}
                            >
                                ›
                            </span>
                        </div>
                    </div>
                    <div style={styles.infoPanelContainer}>
                        <div
                            style={{
                                ...styles.infoPanel,
                                height: 'fit-content',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                            }}
                        >
                            <div style={styles.purchaseInfoContainer}>
                                <img
                                    src={productSprite ?? royalLogo}
                                    alt="Product Image"
                                    style={{
                                        height: '3.25rem',
                                    }}
                                />
                                <div style={styles.purchaseInfo}>
                                    <span style={styles.purchaseInfoTitle}>{productName}</span>
                                    <span style={styles.purchaseInfoSubtitle}>My Game</span>
                                    <span style={styles.purchaseInfoSubtitle}>In-App Purchase</span>
                                </div>
                            </div>
                            <div style={styles.horizontalRule}/>
                            <div style={styles.purchaseInfo}>
                                <span
                                    style={{
                                        ...styles.purchaseInfoTitle,
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                    }}
                                >
                                    {price}
                                </span>
                                <span style={styles.purchaseInfoSubtitle}>One-time charge</span>
                            </div>
                            <div style={styles.horizontalRule}/>
                            <div style={styles.purchaseInfo}>
                                <span style={styles.purchaseInfoSubtitle}>Account: demo-user@example.com</span>
                            </div>
                        </div>
                    </div>

                    <div
                        style={styles.tapToConfirm}
                        onClick={handleConfirmIAP}
                    >
                        <img
                            src={tappingIcon}
                            alt="Tapping Icon"
                            style={{
                                height: '2rem',
                                display: 'block',
                            }}
                        />
                        <span>
                            Tap to Confirm
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles: Record<string, CSSProperties> = {
    container: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0',
        left: '0',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        fontFamily: 'Verdana, Geneva, sans-serif',
        zIndex: '10000',
    },
    panel: {
        width: '100%',
        maxWidth: '50vh',
        height: 'fit-content',
        position: 'absolute',
        top: '100%',
        transform: 'translateY(0%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '4rem 1rem 2rem 1rem',
        animation: 'slideUp 0.5s ease-in-out forwards',
        backgroundColor: '#eae9ea',
        borderRadius: '0.75rem 0.75rem 0 0',
        pointerEvents: 'initial',
    },
    payLogoContainer: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0rem',
        pointerEvents: 'none',
    },
    payLogo: {
        height: '2.5rem',
    },
    payLogoText: {
        fontSize: '1.5rem'
    },
    closeButton: {
        position: 'absolute',
        width: '2rem',
        height: '2rem',
        top: '1rem',
        right: '1rem',
        backgroundColor: '#dcdbde',
        border: 'none',
        borderRadius: '100%',
        fontSize: '1.75rem',
        fontWeight: '500',
        cursor: 'pointer',
    },
    infoPanelContainer: {
        width: '100%',
        display: 'flex',
        pointerEvents: 'none',
    },
    infoPanel: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '0.75rem'
    },
    visaLogo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        backgroundColor: '#0066b1',
        borderRadius: '0.25rem',
    },
    purchaseInfoContainer: {
        display: 'flex',
        gap: '1rem',
    },
    purchaseInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    purchaseInfoTitle: {
        fontSize: '1rem',
        fontWeight: '500',
        lineHeight: '100%',
    },
    purchaseInfoSubtitle: {
        color: '#b3b3b6',
        fontSize: '0.75rem',
        lineHeight: '100%',
    },
    horizontalRule: {
        width: '100%',
        borderTop: '1px solid #d1d1d1',
        margin: '0.75rem 0',
    },
    tapToConfirm: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '1rem'
    }
};
