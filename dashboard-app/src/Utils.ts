import {SmartObjectsPrice, Balancy, BalancyPaymentInfo} from "@balancy/core";

export class Utils {
    public static createTestPaymentInfo(price: SmartObjectsPrice): BalancyPaymentInfo {
        const orderId = Utils.generateGuid();
        const productId = price.product?.productId || "";
        const productPrice = price.product?.price || 0;

        const paymentInfo: BalancyPaymentInfo = {
            price: productPrice,
            currency: "USD",
            orderId: orderId,
            productId: productId,
            receipt: `<receipt>` // Placeholder for receipt
        };

        // Below is the testing receipt, it's not designed for production
        paymentInfo.receipt = JSON.stringify({
            Payload: JSON.stringify({
                json: JSON.stringify({
                    orderId: paymentInfo.orderId,
                    productId: paymentInfo.productId
                }),
                signature: "bypass"
            })
        });

        return paymentInfo;
    }

    private static generateGuid(): string {
        // Generates a GUID-like string
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
            const random = (Math.random() * 16) | 0;
            const value = char === "x" ? random : (random & 0x3) | 0x8;
            return value.toString(16);
        });
    }
}
