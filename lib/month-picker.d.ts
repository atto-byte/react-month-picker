import * as React from 'react';
declare type Month = {
    year: number;
    month: number;
};
declare type Years = Array<number> | number | Month | {
    min: Month;
    max: Month;
};
declare type Range = {
    from: Month;
    to: Month;
};
declare type Language = Array<string> | {
    from: string;
    to: string;
    months: Array<string>;
};
export interface MonthPickerProps {
    years: Years;
    value: Month;
    range: Range;
    lang: Language;
    onChange: (year: number, month: number, index: number) => void;
    onYearChange: (year: number) => void;
    onShow: () => void;
    onDismiss: (value: Month) => void;
    onClickAway: (e: Event) => void;
    theme: 'light' | 'dark';
    show: boolean;
    className: string;
}
interface State {
    values: any;
    labelYears: any;
    years: any;
    yearIndexes: any;
    closeable: boolean;
    showed: boolean;
    lastRange: Range;
    lastValue: Month;
}
export default class MonthPicker extends React.Component<MonthPickerProps, State> {
    static defaultProps: {
        years: any;
        onChange(year: any, month: any, idx: any): void;
        theme: string;
        show: boolean;
    };
    constructor(props: MonthPickerProps, context: any);
    validate(d: any, years: any, idx: any, yearIndexes: any): any;
    validValues(v: any, years: any, yearIndexes: any): any[];
    value(): any;
    componentWillReceiveProps(nextProps: MonthPickerProps): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    optionPad(padIndex: number): JSX.Element;
    render(): JSX.Element;
    dismiss(): void;
    show(): void;
    _handleOverlayTouchTap(e: any): void;
    _onShow(): void;
    _onDismiss(s?: any): void;
    handleClickMonth(e: any): void;
    goPrevYear(e: any): void;
    goNextYear(e: any): void;
    setYear(idx: any, step: any): void;
    getDID(e: any): any;
    _reset(): {
        values: any[];
    };
    _keyDown(e: any): void;
}
export {};
