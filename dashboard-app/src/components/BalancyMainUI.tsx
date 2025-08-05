import React, { useEffect, useState, useCallback } from 'react';
import {Balancy, Callbacks, IViewModel, JsonBasedObject} from '@balancy/core';
import { SmartObjectsViewPlacement } from '@balancy/core';

// Types and interfaces
type SpriteCallback = (blobUrl: string | null) => void;

interface ElementInfo {
  element: React.ReactElement;
  priority: number;
  id: string;
}

interface BalancyElementProps {
  iconUrl?: string;
  getSecondsLeft: () => number;
  onClick: () => void;
}

interface BalancySectionProps {
  placement: SmartObjectsViewPlacement;
  side: 'left' | 'right';
}

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '00:00';

    if (seconds > 3600 * 24 * 365) // 1 year
        return 'oo';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
        if (hours > 0)
            return `${days}d ${hours}h`;
        return `${days}d`;
    } else
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// BalancyElement Component
const BalancyElement: React.FC<BalancyElementProps> = ({ iconUrl, getSecondsLeft, onClick }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const seconds = getSecondsLeft();
      setTimeLeft(formatTime(seconds));
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [getSecondsLeft]);

  return (
    <div
      className="balancy-element"
      onClick={onClick}
      style={{
        width: '70px',
        height: '70px',
        margin: '5px 0',
        backgroundColor: '#2c3e50',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #34495e',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#34495e';
        e.currentTarget.style.borderColor = '#3498db';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#2c3e50';
        e.currentTarget.style.borderColor = '#34495e';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '4px',
          backgroundImage: iconUrl ? `url(${iconUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#fff',
          marginBottom: '2px'
        }}
      >
        {!iconUrl && '🎯'}
      </div>

      {/* Timer */}
      {timeLeft && (
        <div
          style={{
            fontSize: '12px',
            color: '#ecf0f1',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: '1',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              paddingBottom: '5px'
          }}
        >
          {timeLeft}
        </div>
      )}
    </div>
  );
};

// BalancySection Component
const BalancySection: React.FC<BalancySectionProps> = ({ placement, side }) => {
  const [activeElements, setActiveElements] = useState<Map<string, ElementInfo>>(new Map());

  // Universal method to add any element (Event, Offer, OfferGroup)
  const addElementFromViewModel = useCallback((
    id: string,
    viewModel: IViewModel, // IViewModel interface
    owner: JsonBasedObject, // JsonBasedObject
    getSecondsLeft: () => number
  ) => {
    if (!viewModel || viewModel.unnyPlacement !== placement) {
      return;
    }

    const priority = viewModel.unnyPriority || 0;

    // First, add element to state with priority but without icon
    setActiveElements(prev => {
      const newMap = new Map(prev);
      newMap.set(id, {
        element: <div key={id}>Loading...</div>, // Temporary placeholder
        priority,
        id
      });
      return newMap;
    });

    // Callback function for when icon loads
    const onIconLoaded = (blobUrl: string | null) => {
      const element = (
        <BalancyElement
          key={id}
          iconUrl={blobUrl || undefined}
          getSecondsLeft={getSecondsLeft}
          onClick={() => {
            if (viewModel.unnyView) {
                console.log('Opening view:', viewModel.unnyView.id || 'Unknown');
                viewModel.unnyView.openView((success)=>{
                    console.log("OPENED> " + success);
                }, owner);
            } else {
              alert("This element doesn't have a View associated with it.");
            }
          }}
        />
      );

      setActiveElements(prev => {
        const newMap = new Map(prev);
        if (newMap.has(id)) { // Only update if element still exists
          newMap.set(id, { element, priority, id });
        }
        return newMap;
      });
    };

    // Load icon asynchronously
    if (viewModel.icon) {
      viewModel.icon.loadSprite(onIconLoaded);
    } else {
      // No icon, call callback with null
      onIconLoaded(null);
    }
  }, [placement]);

  const removeElement = useCallback((id: string) => {
    setActiveElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const cleanUp = useCallback(() => {
    setActiveElements(new Map());
  }, []);

  // Unified methods using IViewModel interface
  const tryToAddEvent = useCallback((eventInfo: any) => {
    addElementFromViewModel(
      eventInfo.gameEventUnnyId,
      eventInfo.gameEvent,
      eventInfo,
      () => eventInfo.getSecondsLeftBeforeDeactivation()
    );
  }, [addElementFromViewModel]);

  const tryToAddOffer = useCallback((offerInfo: any) => {
    addElementFromViewModel(
      offerInfo.instanceId,
      offerInfo.gameOffer,
      offerInfo,
      () => offerInfo.getSecondsLeftBeforeDeactivation()
    );
  }, [addElementFromViewModel]);

  const tryToAddOfferGroup = useCallback((offerGroupInfo: any) => {
    addElementFromViewModel(
      offerGroupInfo.instanceId,
      offerGroupInfo.gameOfferGroup,
      offerGroupInfo,
      () => offerGroupInfo.getSecondsLeftBeforeDeactivation()
    );
  }, [addElementFromViewModel]);

  const refreshAll = useCallback(() => {
    cleanUp();

    // Get all active events, offers, and offer groups from Balancy
    const system = Balancy.Profiles.system;
    if (!system) return;

    const allEvents = system.smartInfo?.gameEvents;
    const allOffers = system.smartInfo?.gameOffers;
    const allOfferGroups = system.smartInfo?.gameOfferGroups;

    // Add events
    if (allEvents) {
        for (let i = 0; i < allEvents.count; i++) {
        const eventInfo = allEvents.get(i);
        if (eventInfo) {
          tryToAddEvent(eventInfo);
        }
      }
    }

    // Add offers
    if (allOffers) {
      for (let i = 0; i < allOffers.count; i++) {
        const offerInfo = allOffers.get(i);
        if (offerInfo) {
          tryToAddOffer(offerInfo);
        }
      }
    }

    // Add offer groups
    if (allOfferGroups) {
      for (let i = 0; i < allOfferGroups.count; i++) {
        const offerGroupInfo = allOfferGroups.get(i);
        if (offerGroupInfo) {
          tryToAddOfferGroup(offerGroupInfo);
        }
      }
    }
  }, [cleanUp, tryToAddEvent, tryToAddOffer, tryToAddOfferGroup]);

  useEffect(() => {
    // Subscribe to Balancy callbacks and store subscription IDs
    const onNewEventActivatedId = Callbacks.onNewEventActivated.subscribe((eventInfo) => {
      tryToAddEvent(eventInfo);
    });

    const onEventDeactivatedId = Callbacks.onEventDeactivated.subscribe((eventInfo) => {
      removeElement(eventInfo.gameEventUnnyId);
    });

    const onNewOfferActivatedId = Callbacks.onNewOfferActivated.subscribe((offerInfo) => {
      tryToAddOffer(offerInfo);
    });

    const onOfferDeactivatedId = Callbacks.onOfferDeactivated.subscribe((offerInfo) => {
      removeElement(offerInfo.instanceId);
    });

    const onNewOfferGroupActivatedId = Callbacks.onNewOfferGroupActivated.subscribe((offerGroupInfo) => {
      tryToAddOfferGroup(offerGroupInfo);
    });

    const onOfferGroupDeactivatedId = Callbacks.onOfferGroupDeactivated.subscribe((offerGroupInfo) => {
      removeElement(offerGroupInfo.instanceId);
    });

    const onDataUpdatedId = Callbacks.onDataUpdated.subscribe(() => {
      refreshAll();
    });

    // Subscribe to profile reset start event to clean up the screen
    const onProfileResetStartId = Callbacks.onProfileResetStart.subscribe(() => {
      cleanUp();
    });

    // Initial load if Balancy is ready
    if (Balancy.Main.isReadyToUse) {
      refreshAll();
    }

    // Cleanup subscriptions using stored subscription IDs
    return () => {
      Callbacks.onNewEventActivated.unsubscribe(onNewEventActivatedId);
      Callbacks.onEventDeactivated.unsubscribe(onEventDeactivatedId);
      Callbacks.onNewOfferActivated.unsubscribe(onNewOfferActivatedId);
      Callbacks.onOfferDeactivated.unsubscribe(onOfferDeactivatedId);
      Callbacks.onNewOfferGroupActivated.unsubscribe(onNewOfferGroupActivatedId);
      Callbacks.onOfferGroupDeactivated.unsubscribe(onOfferGroupDeactivatedId);
      Callbacks.onDataUpdated.unsubscribe(onDataUpdatedId);
      Callbacks.onProfileResetStart.unsubscribe(onProfileResetStartId);
    };
  }, [tryToAddEvent, tryToAddOffer, tryToAddOfferGroup, removeElement, refreshAll]);

  // Sort elements by priority (highest first)
  const sortedElements = Array.from(activeElements.values())
    .sort((a, b) => b.priority - a.priority)
    .map(elementInfo => elementInfo.element);

  return (
    <div
      className={`balancy-section balancy-section-${side}`}
      style={{
        position: 'fixed',
        top: '80px', // Lowered to be below header
        bottom: '20px',
        [side]: '10px',
        width: '90px',
        // backgroundColor: 'rgba(44, 62, 80, 0.9)',
        // borderRadius: '12px',
        // padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
        overflowY: 'auto',
        // boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        // backdropFilter: 'blur(10px)',
        // border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000
      }}
    >
      {sortedElements}
      {sortedElements.length === 0 && (
        <div
          style={{
            color: '#95a5a6',
            fontSize: '12px',
            textAlign: 'center',
            margin: '20px 0'
          }}
        >
          No active<br />{side === 'left' ? 'left' : 'right'}<br />elements
        </div>
      )}
    </div>
  );
};

// Main BalancyMainUI Component
export const BalancyMainUI: React.FC = () => {
  return (
    <div className="balancy-main-ui">
      <BalancySection
        placement={SmartObjectsViewPlacement.MainLeft}
        side="left"
      />
      <BalancySection
        placement={SmartObjectsViewPlacement.MainRight}
        side="right"
      />
    </div>
  );
};

export default BalancyMainUI;
