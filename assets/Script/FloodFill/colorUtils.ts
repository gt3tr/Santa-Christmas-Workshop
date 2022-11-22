export function getColorAtPixel(imageData: ImageData, x: number, y: number): cc.Color {
    const { width, data } = imageData;
    const startPos = 4 * (y * width + x);
    if (data[startPos + 3] === undefined) {
        throw new Error('Invalid pixel coordinates: x=' + x + '; y=' + y);
    }
    return cc.color(data[startPos], data[startPos + 1], data[startPos + 2], data[startPos + 3]);
}

export function setColorAtPixel(imageData: ImageData, color: cc.Color, x: number, y: number): void {
    const { width, data } = imageData;
    const startPos = 4 * (y * width + x);
    data[startPos + 0] = color.r & 0xff;
    data[startPos + 1] = color.g & 0xff;
    data[startPos + 2] = color.b & 0xff;
    data[startPos + 3] = color.a & 0xff;
    // if (PatternImageData) {
    //     if (isenablepattern) {
    //         PatternImageData.data[startPos + 0] = color.r & 0xff;
    //         PatternImageData.data[startPos + 1] = color.g & 0xff;
    //         PatternImageData.data[startPos + 2] = color.b & 0xff;
    //         PatternImageData.data[startPos + 3] = color.a & 0xff;
    //     } else {
    //         PatternImageData.data[startPos + 0] = 0;
    //         PatternImageData.data[startPos + 1] = 0;
    //         PatternImageData.data[startPos + 2] = 0;
    //         PatternImageData.data[startPos + 3] = 0;
    //     }
    // }
}

export function isSameColor(a: cc.Color, b: cc.Color, tolerance = 0): boolean {
    return !(
        Math.abs(a.r - b.r) > tolerance ||
        Math.abs(a.g - b.g) > tolerance ||
        Math.abs(a.b - b.b) > tolerance ||
        Math.abs(a.a - b.a) > tolerance
    );
}
