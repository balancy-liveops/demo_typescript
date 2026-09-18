/** Uniformly fit the entire oriented device frame inside the available viewport. */
export function fitDeviceScale(width: number, height: number, frameWidth: number, frameHeight: number): number {
    if (![width, height, frameWidth, frameHeight].every(value => Number.isFinite(value) && value > 0)) return 0;
    return Math.min(width / frameWidth, height / frameHeight);
}
