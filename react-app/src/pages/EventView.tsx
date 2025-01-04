import React from "react";
import { SmartObjectsGameEvent } from "@balancy/core";
import { TimeFormatter } from "../TimeFormatter";

interface EventViewProps {
    gameEvent: SmartObjectsGameEvent;
    isActive: boolean;
}

const EventView: React.FC<EventViewProps> = ({ gameEvent, isActive }) => {
    const timeText = isActive
        ? TimeFormatter.formatUnixTime(gameEvent.getSecondsLeftBeforeDeactivation())
        : TimeFormatter.formatUnixTime(gameEvent.getSecondsBeforeActivation());

    return (
        <div style={styles.container}>
            <span style={styles.name}>{gameEvent.name.value}</span>
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
};

export default EventView;
