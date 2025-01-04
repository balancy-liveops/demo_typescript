import React, { useEffect, useState } from "react";
import {
    Balancy,
    SmartObjectsOfferInfo,
    SmartObjectsOfferGroupInfo,
} from "@balancy/core";
import OfferView from "./OfferView";
import OfferGroupView from "./OfferGroupView";

const GameOffersPage: React.FC = () => {
    const [offers, setOffers] = useState<SmartObjectsOfferInfo[]>([]);
    const [offerGroups, setOfferGroups] = useState<SmartObjectsOfferGroupInfo[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshOffers = () => {
        console.log("**** refreshOffers");
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

        console.log("**** set Offers: " + smartInfo.gameOffers?.count);
        // Active Offers
        setOffers(smartInfo.gameOffers?.toArray() || []);

        console.log("**** set Groups: " + smartInfo.gameOfferGroups?.count);
        // Active Offer Groups
        setOfferGroups(smartInfo.gameOfferGroups?.toArray() || []);

        setRefreshKey((prev) => prev + 1);
    };

    useEffect(() => {
        // Add event listeners for real-time updates
        const handleNewOfferActivated = () => refreshOffers();
        const handleOfferDeactivated = (offerInfo: SmartObjectsOfferInfo, wasPurchased: boolean) => {
            console.log("OFFER deactivated: " + offerInfo.instanceId + " ?? " + wasPurchased);
            refreshOffers();
        }
        const handleNewOfferGroupActivated = (offerGroupInfo: SmartObjectsOfferGroupInfo) => refreshOffers();
        const handleOfferGroupDeactivated = (offerGroupInfo: SmartObjectsOfferGroupInfo) => {
            console.log("OFFER Group deactivated");
            refreshOffers();
        }

        Balancy.Callbacks.onNewOfferActivated = handleNewOfferActivated;
        Balancy.Callbacks.onOfferDeactivated = handleOfferDeactivated;
        Balancy.Callbacks.onNewOfferGroupActivated = handleNewOfferGroupActivated;
        Balancy.Callbacks.onOfferGroupDeactivated = handleOfferGroupDeactivated;

        // Refresh offers initially
        refreshOffers();

        return () => {
            // Cleanup event listeners
            Balancy.Callbacks.onNewOfferActivated = null;
            Balancy.Callbacks.onOfferDeactivated = null;
            Balancy.Callbacks.onNewOfferGroupActivated = null;
            Balancy.Callbacks.onOfferGroupDeactivated = null;
        };
    }, []);

    console.log("**** render Offers: " + offers.length + " offerGroups = " + offerGroups.length);
    return (
        <div key={refreshKey} style={{ padding: "20px" }}>
            <h2>Game Offers</h2>

            {/* Offers Section */}
            {offers.length > 0 && (
                <div>
                    <h3>Active Offers</h3>
                    {offers.map((offer) => (
                        <OfferView key={offer.instanceId} offerInfo={offer} />
                    ))}
                </div>
            )}

            {/* Offer Groups Section */}
            {offerGroups.length > 0 && (
                <div>
                    <h3>Active Offer Groups</h3>
                    {offerGroups.map((offerGroup) => (
                        <OfferGroupView key={offerGroup.instanceId} offerGroupInfo={offerGroup} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GameOffersPage;
