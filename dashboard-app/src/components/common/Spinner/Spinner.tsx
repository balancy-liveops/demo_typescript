import * as React from 'react';
import {CSSProperties} from "react";

type SpinnerProps = {
    color?: string;
    size?: string;
    text?: string;
    textSize?: string;
};
export default function Spinner({
    size = '50px',
    color = '#ffffff',
    text,
    textSize,
}: SpinnerProps): JSX.Element | null {
    return (
        <>
            <style>{`
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>

            <div style={styles.spinnerContainer}>
                <div
                    style={{
                        ...styles.spinner,
                        width: size,
                        height: size,
                    }}
                >
                    <div
                        style={{
                            ...styles.spinnerCircle,
                            borderColor: `${color}33`,
                            borderTopColor: color,
                        }}
                    ></div>
                </div>
                {text && (
                    <span
                        style={{
                            ...styles.text,
                            fontSize: textSize,
                        }}
                    >
                        {text}
                    </span>
                )}
            </div>
        </>

    );
}

const styles: Record<string, CSSProperties> = {
    spinnerContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    spinner: {
        width: '50px',
        height: '50px',
    },
    spinnerCircle: {
        width: '100%',
        height: '100%',
        borderWidth: '4px',
        borderStyle: 'solid',
        borderRadius: '100%',
        animation: 'spin 1s linear infinite',
    },
    text: {
        fontSize: '1em',
    }
}
