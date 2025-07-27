import React, { useEffect, useState } from "react";
import { Balancy, SmartObjectsGameEvent, SmartObjectsEventInfo } from "@balancy/core";
import EventView from "./EventView";

const GameEventsPage: React.FC = () => {
    const [activeEvents, setActiveEvents] = useState<SmartObjectsGameEvent[]>([]);
    const [inactiveEvents, setInactiveEvents] = useState<SmartObjectsGameEvent[]>([]);

    const refreshEvents = () => {
        if (!Balancy.Main.isReadyToUse) {
            console.warn("Balancy is not ready to use.");
            return;
        }

        const profile = Balancy.Profiles.system;
        if (!profile) {
            console.error("Balancy profile is not available.");
            return;
        }

        const smartInfo = profile.smartInfo;

        // Active Events
        const activeEventsInfo = smartInfo.gameEvents?.toArray() || [];
        let active: SmartObjectsGameEvent[] = [];
        for (let eventInfo of activeEventsInfo) {
            if (eventInfo.gameEvent) active.push(eventInfo.gameEvent);
        }
        setActiveEvents(active);

        // Inactive Events
        const allEvents = Balancy.CMS.getModels(SmartObjectsGameEvent, true);
        const inactive = allEvents.filter((event) => !smartInfo.hasGameEvent(event));
        setInactiveEvents(inactive);
    };

    useEffect(() => {
        const handleNewEventActivated = (eventInfo: SmartObjectsEventInfo) => refreshEvents();
        const handleEventDeactivated = (eventInfo: SmartObjectsEventInfo) => refreshEvents();

        const eventActivatedId = Balancy.Callbacks.onNewEventActivated.subscribe(handleNewEventActivated);
        const eventDeactivatedId = Balancy.Callbacks.onEventDeactivated.subscribe(handleEventDeactivated);

        refreshEvents();

        const intervalId = setInterval(() => {
            refreshEvents();
        }, 1000); // Refresh every second

        return () => {
            Balancy.Callbacks.onNewEventActivated.unsubscribe(eventActivatedId);
            Balancy.Callbacks.onEventDeactivated.unsubscribe(eventDeactivatedId);

            clearInterval(intervalId); // Clear interval on unmount
        };
    }, []);

    return (
        <div style={styles.pageContainer}>
            <div style={styles.header}>
                <h2 style={styles.title}>Game Events</h2>
            </div>

            <div style={styles.scrollableContent}>
                {/* Active Events */}
                {activeEvents.length > 0 && (
                    <div style={styles.eventSection}>
                        <h3 style={styles.sectionTitle}>Active Events</h3>
                        {activeEvents.map((event) => {
                            return event ?
                                <EventView key={event.unnyId} gameEvent={event} isActive={true}/>
                                : null;
                        })}
                    </div>
                )}

                {/* Inactive Events */}
                {inactiveEvents.length > 0 && (
                    <div style={styles.eventSection}>
                        <h3 style={styles.sectionTitle}>Not Active Events</h3>
                        {inactiveEvents.map((event) => {
                            return event ?
                                <EventView key={event.unnyId} gameEvent={event} isActive={false}/>
                                : null;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 200px)", // Возвращаем 100vh
        boxSizing: "border-box",
    },
    header: {
        padding: "20px",
        flexShrink: 0,
        borderBottom: "1px solid #ddd",
        backgroundColor: "#fff",
        zIndex: 1,
        boxSizing: "border-box",
    },
    title: {
        margin: 0,
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333",
    },
    scrollableContent: {
        flex: 1,
        overflow: "auto", // Главное - оставляем скролл
        padding: "20px",
        paddingBottom: "40px", // Дополнительный отступ внизу
        boxSizing: "border-box",
    },
    eventSection: {
        marginBottom: "30px",
    },
    sectionTitle: {
        margin: 0,
        marginBottom: "15px",
        fontSize: "20px",
        fontWeight: "bold",
        color: "#555",
        borderBottom: "2px solid #ddd",
        paddingBottom: "8px",
    },
};

export default GameEventsPage;
