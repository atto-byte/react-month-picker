import * as React from 'react'


const isBrowser = (typeof window !== "undefined" && typeof document !== "undefined")


const __MIN_VALID_YEAR = 1


function mapToArray(num: number, callback) {
    let arr: any = []
    for (let i = 0; i <  num; i++) {
        arr.push( callback(i) )
    }
    return arr
}

function getYearMon(year: Month | number, min?: number, max?: number) {
    let ym: any = (typeof year === 'object' && year.year ) ? {year: year.year, month: year.month} : {year}
    ym.min = min || 1
    ym.max = max || 12
    return ym
}

function getYearsByNum(n: number, minYear?: number) {
    let maxYear = (new Date()).getFullYear()
    // n is number of years
    if (n && n > 0 && n < 1000) {
        minYear = minYear || (maxYear - n + 1)
    }
    // n is invalid value
    else {
        // n is max year
        if (n && n >= 1000)
            maxYear = n

        if (minYear) {
            n = maxYear - minYear + 1
        } else {
            n = 5
            minYear = maxYear - n + 1
        }
    }
    return mapToArray(n, i => {
        return getYearMon(minYear + i)
    })
}

function getYearArray(years: Years) {
    if (Array.isArray(years))
        return years.map((y, i) => {
            return getYearMon(y)
        })
    else if (typeof years === 'number' && years > 0)
        return getYearsByNum(years)
    else if(typeof years !== 'number' && 'min' in years) {
        let n = 0, min = 0
        let ymin = getYearMon(years.min)
        let ymax = getYearMon(years.max)
        if ((typeof ymin.year === 'number') && ymin.year > __MIN_VALID_YEAR)
            min = ymin.year
        if ((typeof ymax.year === 'number') && ymax.year >= min)
            n = ymax.year

        
        let arr = getYearsByNum(n, min)
            , last = arr.length - 1
        if (last >= 0) {
            arr[0].min = ymin.month || arr[0].month
            arr[last].max = ymax.month || arr[last].month
        }
        return arr
    }
    
    else
        return getYearsByNum(5)
}

type Month = {year: number, month: number}
type MinMaxMonth = {min: Month, max: Month}
type Years = Array<number> | number | MinMaxMonth

type Range = {
    from: Month,
    to: Month
}
type Language = Array<string> | {from: string, to: string, months: Array<string>}
export interface MonthPickerProps {
    years: Years;
    value: Month;
    range?: Range;
    lang?: Language;
    onChange?: (year: number, month: number, index: number) => void;
    onYearChange?: (year: number) => void;
    onShow?: () => void;
    onDismiss?: (value: Month) => void;
    onClickAway?: (e: Event) => void;
    theme?: 'light' | 'dark';
    show?: boolean;
    className?: string;
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

    static defaultProps = {
        years: getYearsByNum(5),
        onChange(year, month, idx) {},
        theme: 'light',
        show: false,
    }

    constructor(props: MonthPickerProps, context) {
        super(props, context)

        const yearArr = getYearArray(this.props.years)
            , yearIndexes = [0]
            , values = this.validValues(this.props.range || this.props.value, yearArr, yearIndexes)
        this.state = {
            years: yearArr,
            values: values,
            labelYears: [false, false],
            showed: this.props.show,
            closeable: this.props.show, //special, must not be changed with setState
            yearIndexes: yearIndexes,
            lastRange: this.props.range,
            lastValue: this.props.value,
        }

        this._handleOverlayTouchTap = this._handleOverlayTouchTap.bind(this)
        this.handleClickMonth = this.handleClickMonth.bind(this)
        this.goPrevYear = this.goPrevYear.bind(this)
        this.goNextYear = this.goNextYear.bind(this)
        this._keyDown = this._keyDown.bind(this)
    }

    validate(d, years, idx, yearIndexes) {
        let now = new Date()
            , thisYear = now.getFullYear()
            , ym
        if (d && (typeof d.year === 'number') && d.year > __MIN_VALID_YEAR
            && (typeof d.month === 'number') && d.month >= 1 && d.month <= 12) {
            ym = d
        }

        let foundThisYear
        for (let i = 0; i < years.length; i++) {
            if (ym && years[i].year === ym.year) {
                yearIndexes[idx] = i
                return ym
            }
            else if (years[i].year === thisYear) {
                foundThisYear = i
            }
        }

        if (typeof foundThisYear === 'number') {
            yearIndexes[idx] = foundThisYear
            return { year: thisYear }
        }

        const last = yearIndexes[idx] = years.length - 1
        return { year: years[last].year }

    }
    validValues(v, years, yearIndexes) {
        if (!v)
            return []
        if (v.from || v.to) {
            let from = this.validate(v.from, years, 0, yearIndexes)
                , to = this.validate(v.to, years, 1, yearIndexes)
            if (from.year > to.year || (from.year === to.year && from.month > to.month)) {
                from.year = to.year
                from.month = to.month
                if (from.month < 1) {
                    from.year--
                    from.month += 12
                }
            }
            return [from, to]
        }
        return [this.validate(v, years, 0, yearIndexes)]
    }

    value() {
        const values = this.state.values
        if (values.length >= 2)
            return { from: values[0], to: values[1] }
        else if (values.length === 1)
            return values[0]
        return {}
    }


    componentWillReceiveProps(nextProps: MonthPickerProps) {
        const yearArr = getYearArray(nextProps.years)
            , yearIndexes = this.state.yearIndexes
            , nextValues = nextProps.range || nextProps.value //|| this.props.range || this.props.value
            , values = this.validValues(nextValues, yearArr, yearIndexes)
        this.setState({
            years: yearArr,
            values: values,
            labelYears: [false, false],
            yearIndexes: yearIndexes,
            lastRange: nextProps.range,
            lastValue: nextProps.value,
            showed: nextProps.show,
            closeable: nextProps.show,
        })
    }

    componentDidMount () {
        if (isBrowser) {
            document.addEventListener('keydown', this._keyDown)
        }
    }
    componentWillUnmount () {
        if (isBrowser) {
            document.removeEventListener('keydown', this._keyDown)
        }
    }

    optionPad(padIndex: number): JSX.Element {
        let values = this.state.values
        let value = values[padIndex]
        let labelYears = this.state.labelYears
        let labelYear = labelYears[padIndex] = labelYears[padIndex] || value.year
        let ymArr = this.state.years
        let lang = this.props.lang || []
        let months =  Array.isArray(lang) ? lang : (Array.isArray(lang.months) ? lang.months : [])
        let prevCss = '', nextCss = ''
        let yearMaxIdx = ymArr.length - 1
        let yearIdx = this.state.yearIndexes[padIndex]//yearMaxIdx

        if (yearIdx === 0) prevCss = 'disable'
        if (yearIdx === yearMaxIdx) nextCss = 'disable'

        let yearActive = (labelYear === value.year)
        let atMinYear = (labelYear === ymArr[0].year)
        let atMaxYear = (labelYear === ymArr[yearMaxIdx].year)
        let otherValue: any = false
        if (values.length > 1) {
            otherValue = values[1 - padIndex]
        }

        let labelTextKey = padIndex === 0 ? 'from' : 'to'
            , labelPreText
        if (otherValue && this.props.lang[labelTextKey]) {
            labelPreText = <b>{this.props.lang[labelTextKey]}</b>
        }

        return (
            <div className="rmp-pad" key={padIndex}>
                <div>
                    <label>{labelPreText}{labelYear}</label>
                    <i className={["rmp-tab", "rmp-btn", "prev", prevCss].join(' ')} data-id={padIndex} onClick={this.goPrevYear}>{'<'}</i>
                    <i className={["rmp-tab", "rmp-btn", "next", nextCss].join(' ')} data-id={padIndex} onClick={this.goNextYear}>{'>'}</i>
                </div>
                <ul>
                    {
                        mapToArray(12, i => {
                            let css = ''
                                , m = i + 1
                            if (yearActive && m === value.month) {
                                css = 'active'
                            }
                            if (values.length > 1 && padIndex === 0 && (labelYear > value.year || (labelYear === value.year && m > value.month))) {
                                css = 'select'
                            }
                            if (values.length > 1 && padIndex === 1 && (labelYear < value.year || (labelYear === value.year && m < value.month))) {
                                css = 'select'
                            }
                            if (atMinYear && m < ymArr[0].min) {
                                css = 'disable'
                            }
                            if (atMaxYear && m > ymArr[yearMaxIdx].max) {
                                css = 'disable'
                            }
                            if (otherValue) {
                                let y = otherValue.year, m = otherValue.month || 0
                                    , vy = labelYear, vm = i + 1
                                if (y === vy && m && ( (padIndex === 0 && vm > m) || (padIndex === 1 && vm < m) )) {
                                    css = 'disable'
                                }
                                else if ((y > vy && padIndex === 1) || (y < vy && padIndex === 0)) {
                                    css = 'disable'
                                }
                            }
                            let clickHandler = css !== 'disable' ? this.handleClickMonth : undefined
                            return (
                                <li key={i} className={["rmp-btn", css].join(' ')}
                                    data-id={padIndex + ':' + (i+1)}
                                    onClick={clickHandler}>{months.length > i ? months[i] : i}</li>
                            )
                        })
                    }
                </ul>
            </div>
        )
    }

    render() {
        const pads: JSX.Element[] = []
        let popupClass = ''
        if (this.state.values.length > 1) {
            pads.push( this.optionPad(0), this.optionPad(1) )
            popupClass = 'range'
        }
        else {
            pads.push( this.optionPad(0) )
        }

        return (
            <div className={["month-picker", this.props.className].join(' ')}>
                {this.props.children}
                <div className={["rmp-container", "rmp-table", this.props.className, (this.state.showed ? "show" : '')].join(' ')}>
                    <div className="rmp-overlay" onTouchEnd={this._handleOverlayTouchTap} />
                    <div className="rmp-cell">
                        <div className={["rmp-popup", popupClass , this.props.theme, (this.state.showed ? "show" : '')].join(' ')}>
                            {pads}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    dismiss() {
        if (this.state.closeable) {
            this._onDismiss()
        }
    }

    show() {
        // prevent rapid show/hide
        this._onShow()
    }

    _handleOverlayTouchTap(e) {
        if (this.state.closeable) {
            this._onDismiss()
            this.props.onClickAway && this.props.onClickAway(e)
        }
    }

    _onShow() {
        setTimeout(()  => this.setState({closeable: true}), 250);
        this.setState({ showed: true })
        this.props.onShow && this.props.onShow()
    }

    _onDismiss(s?: any) {
        this.setState(Object.assign({showed: false, loading: false}, s))
        this.props.onDismiss && this.props.onDismiss(this.value())
    }

    handleClickMonth(e) {
        if (this.state.showed) {
            const refid = this.getDID(e).split(':')
                , idx = parseInt(refid[0], 10)
                , month = parseInt(refid[1], 10)
                , year = this.state.labelYears[idx]
                , values = this.state.values
            values[idx] = { year, month }
            this.setState({ values: values })
            this.props.onChange(year, month, idx)
        }
    }

    goPrevYear(e) {
        let idx = parseInt(this.getDID(e), 10)
        if (this.state.yearIndexes[idx] > 0) {
            this.setYear(idx, -1)
        }
    }
    goNextYear(e) {
        let idx = parseInt(this.getDID(e), 10)
        if (this.state.yearIndexes[idx] < (this.state.years.length - 1)) {
            this.setYear(idx, 1)
        }
    }
    setYear(idx, step) {
        let yearIndex = (this.state.yearIndexes[idx] += step)
            , labelYears = this.state.labelYears
            , theYear = this.state.years[yearIndex].year
        labelYears[idx] = theYear
        this.setState({
            labelYears: labelYears
        })
        this.props.onYearChange && this.props.onYearChange(theYear)
    }

    getDID(e) {
        let el = e.target
        return el.dataset ? el.dataset.id : el.getAttribute('data-id')
    }

    _reset() {
        const values = this.validValues(this.state.lastRange || this.state.lastValue, this.state.years, this.state.yearIndexes)
        return {values}
    }

    _keyDown(e) {
        if (!this.state.showed)
            return

        if (e.key === 'Escape') {
            this._onDismiss(this._reset())
            e.stopPropagation()
        }
        else if (e.key === 'Enter') {
            this._onDismiss()
            e.stopPropagation()
        }
        else if (this.state.values.length === 1) {
            //console.log(e.key, e.keyCode)
            // const value = this.state.values[0]
            //     , year = value.year
            // let month = value.month
            // if (e.key === 'ArrowLeft') {
            //     month--
            // }
            // else if (e.key === 'ArrowRight') {
            //     month++
            // }
            // else if (e.key === 'ArrowUp') {
            //     month -= 3
            // }
            // else if (e.key === 'ArrowDown') {
            //     month += 3
            // }
            // if (month > 0 && month < 13 && month !== value.month) {
            //     this.setState({ values: [{ year, month }] })
            //     this.props.onChange(year, month, 0)
            //     e.stopPropagation()
            // }
        }
    }
}
