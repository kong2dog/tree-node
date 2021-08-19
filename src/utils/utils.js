import {
    CAP_FONT_SIZE, CAP_RADIOUS, CAP_MIN_WIDTG, CAP_TEXT_MAX_WIDTH, CANVAS_FONT_STYLE
} from '../constant/constant';
/**
 * 获取字体宽度 以及字体内容
 * @param { CanvasRenderingContext2D } context canvas 画笔
 * @param { String } text 文字内容
 * @param { Number } fontSize 字体大小
 * @returns { Object } object.width 字体宽度; object.text 字体内容
 */
export const getTextWidthAndFilterText = (context, text, fontSize, fontStyle) => {
    context.font = `${fontSize}px ${fontStyle}`;
    const arrText = text.split('');
    let line = '';
    for (let n = 0; n < arrText.length; n++) {
        const testLine = line + arrText[n];
        const metrics = context.measureText(testLine);
        line = testLine;
        if (metrics.width > CAP_TEXT_MAX_WIDTH) {
            line = `${line.slice(0, -3)}...`;
            break;
        }
    }
    return {
        width: context.measureText(line).width,
        text: line
    };
};

/**
 * 获取 device 的宽度,及过滤后的内容
 * @param { CanvasRenderingContext2D } context context canvas 画笔
 * @param { String } text 文字内容
 * @returns  object.width device的宽度; object.text 字体内容;object.textWidth 文本内容宽度
 */
export const getDeviceWidth = (context, text) => {
    const obj = getTextWidthAndFilterText(context, text, CAP_FONT_SIZE, CANVAS_FONT_STYLE);
    let deviceWidth = obj.width + 15;
    if (deviceWidth < CAP_MIN_WIDTG) {
        deviceWidth = CAP_MIN_WIDTG;
    }
    deviceWidth += 3 * CAP_RADIOUS;
    return {
        textWidth: obj.width,
        width: deviceWidth,
        text: obj.text
    };
};
