import { EventEmitter } from 'events';

export enum IAPEvents {
    IAP_OPENED = 'iap_opened',
    IAP_PURCHASED = 'iap_purchased',
    IAP_ERROR = 'iap_error',
}

type DefaultEventMap = {
    [IAPEvents.IAP_OPENED]: (productName: string, price: string)=> void;
    [IAPEvents.IAP_PURCHASED]: (isSuccess: boolean)=> void;
    [IAPEvents.IAP_ERROR]: (error: Error)=> void;
}

class IAPEventEmitter extends EventEmitter {
    on<K extends keyof DefaultEventMap>(eventName: K, listener: DefaultEventMap[K]): this {
        return super.on(eventName, listener);
    }
    off<K extends keyof DefaultEventMap>(eventName: K, listener: DefaultEventMap[K]): this {
        return super.off(eventName, listener);
    }
    once<K extends keyof DefaultEventMap>(eventName: K, listener: DefaultEventMap[K]): this {
        return super.once(eventName, listener);
    }
    emit<K extends keyof DefaultEventMap>(eventName: K, ...args: Parameters<DefaultEventMap[K]>): boolean {
        return super.emit(eventName, ...args);
    }
}

export default new IAPEventEmitter();
