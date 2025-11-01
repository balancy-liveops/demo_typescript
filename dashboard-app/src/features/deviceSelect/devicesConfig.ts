import {
    androidCompact, androidMedium,
    iphone13Mini,
    iphone14,
    iphone14Plus,
    iphone15Pro,
    iphone15ProMax,
    iphone16,
    iphone16Plus,
    iphone16ProMax,
    iphoneSE,
} from './deviceImages.index';

export type DeviceConfig = {
    id: string;
    name: string;
    width: number;
    height: number;
    mockup?: {
        image: string;
        paddingTop?: number;
        paddingRight?: number;
        paddingBottom?: number;
        paddingLeft?: number;
        borderRadius?: number;
        pixelRatio?: number;
        spaceForIsland?: number;
    }
};

export const PORTRAIT_DEVICES_CONFIG: DeviceConfig[] = [
    {
        id:     'android-compact',
        name:   'Android Compact',
        width:  412,
        height: 917,
        mockup: {
            image:         androidCompact,
            paddingTop:    11,
            paddingRight:  21,
            paddingBottom: 21,
            paddingLeft:   16,
            borderRadius:  0,
            pixelRatio: 1.5,
            spaceForIsland: 38,
        },
    },
    {
        id:     'android-medium',
        name:   'Android Medium',
        width:  700,
        height: 840,
        mockup: {
            image:         androidMedium,
            paddingTop:    8,
            paddingRight:  18,
            paddingBottom: 19,
            paddingLeft:   9,
            borderRadius:  20,
            pixelRatio: 1.5,
        },
    },
    {
        id:     'iphone-16',
        name:   'iPhone 16',
        width:  393,
        height: 852,
        mockup: {
            image:         iphone16,
            paddingTop:    18,
            paddingRight:  23,
            paddingBottom: 21,
            paddingLeft:   22,
            borderRadius:  56,
            pixelRatio: 1.5,
            spaceForIsland: 58,
        },
    },
    {
        id:     'iphone-16-pro',
        name:   'iPhone 16 Pro',
        width:  402,
        height: 874,
        mockup: {
            image:         iphone16ProMax,
            paddingTop:    17,
            paddingRight:  14,
            paddingBottom: 13,
            paddingLeft:   22,
            borderRadius:  62,
            pixelRatio: 1.5,
            spaceForIsland: 64,
        },
    },
    {
        id:     'iphone-16-pro-max',
        name:   'iPhone 16 Pro Max',
        width:  440,
        height: 956,
        mockup: {
            image:         iphone16ProMax,
            paddingTop:    17,
            paddingRight:  17,
            paddingBottom: 16,
            paddingLeft:   22,
            borderRadius:  68,
            pixelRatio: 1.5,
            spaceForIsland: 70,
        },
    },
    {
        id:     'iphone-16-plus',
        name:   'iPhone 16 Plus',
        width:  430,
        height: 932,
        mockup: {
            image:         iphone16Plus,
            paddingTop:    20,
            paddingRight:  25,
            paddingBottom: 23,
            paddingLeft:   25,
            borderRadius:  60,
            pixelRatio: 1.5,
            spaceForIsland: 64,
        },
    },
    {
        id:     'iphone-14-15-pro-max',
        name:   'iPhone 14 & 15 Pro Max',
        width:  430,
        height: 932,
        mockup: {
            image:         iphone15ProMax,
            paddingTop:    15,
            paddingRight:  20,
            paddingBottom: 14,
            paddingLeft:   17,
            borderRadius:  56,
            pixelRatio: 1.5,
            spaceForIsland: 62,
        },
    },
    {
        id:     'iphone-14-15-pro',
        name:   'iPhone 14 & 15 Pro',
        width:  393,
        height: 852,
        mockup: {
            image:         iphone15Pro,
            paddingTop:    15,
            paddingRight:  18,
            paddingBottom: 15,
            paddingLeft:   19,
            borderRadius:  58,
            pixelRatio: 1.5,
            spaceForIsland: 60,
        },
    },
    {
        id:     'iphone-13-14',
        name:   'iPhone 13 & 14',
        width:  390,
        height: 844,
        mockup: {
            image:         iphone14,
            paddingTop:    13,
            paddingRight:  17,
            paddingBottom: 25,
            paddingLeft:   26,
            borderRadius:  48,
            pixelRatio: 1.5,
            spaceForIsland: 32,
        },
    },
    {
        id:     'iphone-14-plus',
        name:   'iPhone 14 Plus',
        width:  428,
        height: 926,
        mockup: {
            image:         iphone14Plus,
            paddingTop:    21,
            paddingRight:  22,
            paddingBottom: 20,
            paddingLeft:   26,
            borderRadius:  50,
            pixelRatio: 1.5,
            spaceForIsland: 36,
        },
    },
    {
        id:     'iphone-13-mini',
        name:   'iPhone 13 Mini',
        width:  375,
        height: 812,
        mockup: {
            image:         iphone13Mini,
            paddingTop:    17,
            paddingRight:  21,
            paddingBottom: 19,
            paddingLeft:   24,
            borderRadius:  48,
            pixelRatio: 1.5,
            spaceForIsland: 31,
        },
    },
    {
        id:     'iphone-se',
        name:   'iPhone SE',
        width:  320,
        height: 568,
        mockup: {
            image:         iphoneSE,
            paddingTop:    126,
            paddingRight:  63,
            paddingBottom: 125,
            paddingLeft:   62,
            borderRadius:  0,
            pixelRatio: 1.5,
        },
    },
];

export const LANDSCAPE_DEVICES_CONFIG: DeviceConfig[] = PORTRAIT_DEVICES_CONFIG.map((device) => ({
    ...device,
    id:     `${device.id}-landscape`,
    width:  device.height,
    height: device.width,
}));

export const ALL_DEVICES_CONFIG = [
    ...PORTRAIT_DEVICES_CONFIG,
    ...LANDSCAPE_DEVICES_CONFIG,
];
