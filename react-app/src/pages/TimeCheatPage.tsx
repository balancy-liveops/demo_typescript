import { useEffect, useState } from "react";
import { Balancy } from "@balancy/core";

const TimeCheatPanel: React.FC = () => {
    const [timeOffset, setTimeOffset] = useState(0);

    useEffect(() => {
        const initialOffset = Balancy.API.getTimeCheatingOffset();
        setTimeOffset(initialOffset);
    }, []);

    const changeTime = (seconds: number) => {
        const newOffset = timeOffset + seconds;
        setTimeOffset(newOffset);
        console.log("**** Balancy.API.setTimeCheatingOffset ****", newOffset);
        Balancy.API.setTimeCheatingOffset(newOffset);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                // height: "100vh",
                background: "linear-gradient(to bottom, black, gray 900)",
                // color: "white",
            }}
        >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Time Offset</h2>
            <p style={{ fontSize: "2.25rem", fontWeight: 700 }}>
                {Math.floor(timeOffset / 3600)}h {Math.floor((timeOffset % 3600) / 60)}m
            </p>

            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                    { label: "10 min", value: 600 },
                    { label: "hour", value: 3600 },
                    { label: "day", value: 86400 },
                ].map(({ label, value }) => (
                    <div
                        key={label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "1rem",
                        }}
                    >
                        <button
                            style={{
                                width: "4rem",
                                height: "4rem",
                                fontSize: "1.5rem",
                                fontWeight: 700,
                                backgroundColor: "#ef4444",
                                color: "white",
                                borderRadius: "0.5rem",
                                border: "none",
                                cursor: "pointer",
                            }}
                            onClick={() => changeTime(-value)}
                        >
                            {"<"}
                        </button>
                        <span style={{ width: "6rem", textAlign: "center", fontSize: "1.25rem" }}>{label}</span>
                        <button
                            style={{
                                width: "4rem",
                                height: "4rem",
                                fontSize: "1.5rem",
                                fontWeight: 700,
                                backgroundColor: "#22c55e",
                                color: "white",
                                borderRadius: "0.5rem",
                                border: "none",
                                cursor: "pointer",
                            }}
                            onClick={() => changeTime(value)}
                        >
                            {">"}
                        </button>
                    </div>
                ))}
            </div>

            <button
                style={{
                    marginTop: "1.5rem",
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "white",
                    color: "black",
                    fontWeight: 600,
                    borderRadius: "0.5rem",
                    border: "none",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                }}
                onClick={() => changeTime(-timeOffset)}
            >
                Reset
            </button>
        </div>
    );
};

export default TimeCheatPanel;
