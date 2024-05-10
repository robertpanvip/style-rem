function createPxReplace(rootValue: number, unitPrecision: number, minPixelValue: number) {
    return (m: string, $1: string) => {
        if (!$1) return m;
        const pixels = parseFloat($1);
        if (pixels <= minPixelValue) return m;
        const fixedVal = toFixed(pixels / rootValue, unitPrecision);
        return fixedVal === 0 ? "0" : fixedVal + "rem";
    };
}

function toFixed(number: number, precision: number) {
    const multiplier = Math.pow(10, precision + 1),
        wholeNumber = Math.floor(number * multiplier);
    return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

function dashCase(inputStr: string): string {
    return inputStr.replace(/([A-Z])/g, (match) => '-' + match.toLowerCase());
}


const pxRegex = (unit: string) => new RegExp(
    `"[^"]+"|'[^']+'|url\\([^)]+\\)|var\\([^)]+\\)|(\\d*\\.?\\d+)${unit}`,
    'g',
);

const style = document.createElement('div').style;
const setProperty = CSSStyleDeclaration.prototype.setProperty;

const defaultConfig = {
    unit: 'px',
    rootValue: 16,
    unitPrecision: 5,
    minPixelValue: 1,
}

export type Config = {
    rootValue: number,
    unitPrecision: number,
    minPixelValue: number,
    unit: string;
}

function pxToRem(config: Partial<Config> = {...defaultConfig}) {
    const {
        rootValue,
        unitPrecision,
        minPixelValue,
        unit
    } = {...defaultConfig, ...config};
    const pxReplace = createPxReplace(
        rootValue,
        unitPrecision,
        minPixelValue,
    );
    Object.keys(style).filter(item => !['left', 'top', 'bottom', 'right'].includes(item)).forEach((property) => {
        const dashCaseProperty = dashCase(property)
        Object.defineProperty(CSSStyleDeclaration.prototype, property, {
            get() {
                return this.getPropertyValue(dashCaseProperty);
            },
            set(val: string) {
                const value = val.replace(pxRegex(unit), pxReplace);
                return setProperty.call(this, dashCaseProperty, value);
            }
        });
        CSSStyleDeclaration.prototype.setProperty = function (property: string, val: string) {
            if (property.startsWith('--')) {
                const value = val.replace(pxRegex(unit), pxReplace);
                return setProperty.call(this, property, value);
            }
            return setProperty.call(this, property, val);
        }
    })
}

export default pxToRem
