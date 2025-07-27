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
        <div style={{ padding: "20px" }}>
            <h2>Game Events</h2>

            {/* Active Events */}
            {activeEvents.length > 0 && (
                <div>
                    <h3>Active Events</h3>
                    {activeEvents.map((event) => {
                        return event ?
                            <EventView key={event.unnyId} gameEvent={event} isActive={true}/>
                            : null;
                    })}
                </div>
            )}

            {/* Inactive Events */}
            {inactiveEvents.length > 0 && (
                <div>
                    <h3>Not Active Events</h3>
                    {inactiveEvents.map((event) => {
                        return event ?
                            <EventView key={event.unnyId} gameEvent={event} isActive={false}/>
                            : null;
                    })}
                </div>
            )}
        </div>
    );
};

export default GameEventsPage;
