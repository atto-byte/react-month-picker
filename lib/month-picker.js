"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var isBrowser = (typeof window !== "undefined" && typeof document !== "undefined");
var __MIN_VALID_YEAR = 1;
function mapToArray(num, callback) {
    var arr = [];
    for (var i = 0; i < num; i++) {
        arr.push(callback(i));
    }
    return arr;
}
function getYearMon(year, min, max) {
    var ym = (typeof year === 'object' && year.year) ? { year: year.year, month: year.month } : { year: year };
    ym.min = min || 1;
    ym.max = max || 12;
    return ym;
}
function getYearsByNum(n, minYear) {
    var maxYear = (new Date()).getFullYear();
    if (n && n > 0 && n < 1000) {
        minYear = minYear || (maxYear - n + 1);
    }
    else {
        if (n && n >= 1000)
            maxYear = n;
        if (minYear) {
            n = maxYear - minYear + 1;
        }
        else {
            n = 5;
            minYear = maxYear - n + 1;
        }
    }
    return mapToArray(n, function (i) {
        return getYearMon(minYear + i);
    });
}
function getYearArray(years) {
    if (Array.isArray(years))
        return years.map(function (y, i) {
            return getYearMon(y);
        });
    else if (typeof years === 'number' && years > 0)
        return getYearsByNum(years);
    else if (typeof years !== 'number' && 'min' in years) {
        var n = 0, min = 0;
        var ymin = getYearMon(years.min);
        var ymax = getYearMon(years.max);
        if ((typeof ymin.year === 'number') && ymin.year > __MIN_VALID_YEAR)
            min = ymin.year;
        if ((typeof ymax.year === 'number') && ymax.year >= min)
            n = ymax.year;
        var arr = getYearsByNum(n, min), last = arr.length - 1;
        if (last >= 0) {
            arr[0].min = ymin.month || arr[0].month;
            arr[last].max = ymax.month || arr[last].month;
        }
        return arr;
    }
    else
        return getYearsByNum(5);
}
var MonthPicker = (function (_super) {
    __extends(MonthPicker, _super);
    function MonthPicker(props, context) {
        var _this = _super.call(this, props, context) || this;
        var yearArr = getYearArray(_this.props.years), yearIndexes = [0], values = _this.validValues(_this.props.range || _this.props.value, yearArr, yearIndexes);
        _this.state = {
            years: yearArr,
            values: values,
            labelYears: [false, false],
            showed: _this.props.show,
            closeable: _this.props.show,
            yearIndexes: yearIndexes,
            lastRange: _this.props.range,
            lastValue: _this.props.value,
        };
        _this._handleOverlayTouchTap = _this._handleOverlayTouchTap.bind(_this);
        _this.handleClickMonth = _this.handleClickMonth.bind(_this);
        _this.goPrevYear = _this.goPrevYear.bind(_this);
        _this.goNextYear = _this.goNextYear.bind(_this);
        _this._keyDown = _this._keyDown.bind(_this);
        return _this;
    }
    MonthPicker.prototype.validate = function (d, years, idx, yearIndexes) {
        var now = new Date(), thisYear = now.getFullYear(), ym;
        if (d && (typeof d.year === 'number') && d.year > __MIN_VALID_YEAR
            && (typeof d.month === 'number') && d.month >= 1 && d.month <= 12) {
            ym = d;
        }
        var foundThisYear;
        for (var i = 0; i < years.length; i++) {
            if (ym && years[i].year === ym.year) {
                yearIndexes[idx] = i;
                return ym;
            }
            else if (years[i].year === thisYear) {
                foundThisYear = i;
            }
        }
        if (typeof foundThisYear === 'number') {
            yearIndexes[idx] = foundThisYear;
            return { year: thisYear };
        }
        var last = yearIndexes[idx] = years.length - 1;
        return { year: years[last].year };
    };
    MonthPicker.prototype.validValues = function (v, years, yearIndexes) {
        if (!v)
            return [];
        if (v.from || v.to) {
            var from = this.validate(v.from, years, 0, yearIndexes), to = this.validate(v.to, years, 1, yearIndexes);
            if (from.year > to.year || (from.year === to.year && from.month > to.month)) {
                from.year = to.year;
                from.month = to.month;
                if (from.month < 1) {
                    from.year--;
                    from.month += 12;
                }
            }
            return [from, to];
        }
        return [this.validate(v, years, 0, yearIndexes)];
    };
    MonthPicker.prototype.value = function () {
        var values = this.state.values;
        if (values.length >= 2)
            return { from: values[0], to: values[1] };
        else if (values.length === 1)
            return values[0];
        return {};
    };
    MonthPicker.prototype.componentWillReceiveProps = function (nextProps) {
        var yearArr = getYearArray(nextProps.years), yearIndexes = this.state.yearIndexes, nextValues = nextProps.range || nextProps.value, values = this.validValues(nextValues, yearArr, yearIndexes);
        this.setState({
            years: yearArr,
            values: values,
            labelYears: [false, false],
            yearIndexes: yearIndexes,
            lastRange: nextProps.range,
            lastValue: nextProps.value,
            showed: nextProps.show,
            closeable: nextProps.show,
        });
    };
    MonthPicker.prototype.componentDidMount = function () {
        if (isBrowser) {
            document.addEventListener('keydown', this._keyDown);
        }
    };
    MonthPicker.prototype.componentWillUnmount = function () {
        if (isBrowser) {
            document.removeEventListener('keydown', this._keyDown);
        }
    };
    MonthPicker.prototype.optionPad = function (padIndex) {
        var _this = this;
        var values = this.state.values;
        var value = values[padIndex];
        var labelYears = this.state.labelYears;
        var labelYear = labelYears[padIndex] = labelYears[padIndex] || value.year;
        var ymArr = this.state.years;
        var lang = this.props.lang || [];
        var months = Array.isArray(lang) ? lang : (Array.isArray(lang.months) ? lang.months : []);
        var prevCss = '', nextCss = '';
        var yearMaxIdx = ymArr.length - 1;
        var yearIdx = this.state.yearIndexes[padIndex];
        if (yearIdx === 0)
            prevCss = 'disable';
        if (yearIdx === yearMaxIdx)
            nextCss = 'disable';
        var yearActive = (labelYear === value.year);
        var atMinYear = (labelYear === ymArr[0].year);
        var atMaxYear = (labelYear === ymArr[yearMaxIdx].year);
        var otherValue = false;
        if (values.length > 1) {
            otherValue = values[1 - padIndex];
        }
        var labelTextKey = padIndex === 0 ? 'from' : 'to', labelPreText;
        if (otherValue && this.props.lang[labelTextKey]) {
            labelPreText = React.createElement("b", null, this.props.lang[labelTextKey]);
        }
        return (React.createElement("div", { className: "rmp-pad", key: padIndex },
            React.createElement("div", null,
                React.createElement("label", null,
                    labelPreText,
                    labelYear),
                React.createElement("i", { className: ["rmp-tab", "rmp-btn", "prev", prevCss].join(' '), "data-id": padIndex, onClick: this.goPrevYear }, '<'),
                React.createElement("i", { className: ["rmp-tab", "rmp-btn", "next", nextCss].join(' '), "data-id": padIndex, onClick: this.goNextYear }, '>')),
            React.createElement("ul", null, mapToArray(12, function (i) {
                var css = '', m = i + 1;
                if (yearActive && m === value.month) {
                    css = 'active';
                }
                if (values.length > 1 && padIndex === 0 && (labelYear > value.year || (labelYear === value.year && m > value.month))) {
                    css = 'select';
                }
                if (values.length > 1 && padIndex === 1 && (labelYear < value.year || (labelYear === value.year && m < value.month))) {
                    css = 'select';
                }
                if (atMinYear && m < ymArr[0].min) {
                    css = 'disable';
                }
                if (atMaxYear && m > ymArr[yearMaxIdx].max) {
                    css = 'disable';
                }
                if (otherValue) {
                    var y = otherValue.year, m_1 = otherValue.month || 0, vy = labelYear, vm = i + 1;
                    if (y === vy && m_1 && ((padIndex === 0 && vm > m_1) || (padIndex === 1 && vm < m_1))) {
                        css = 'disable';
                    }
                    else if ((y > vy && padIndex === 1) || (y < vy && padIndex === 0)) {
                        css = 'disable';
                    }
                }
                var clickHandler = css !== 'disable' ? _this.handleClickMonth : undefined;
                return (React.createElement("li", { key: i, className: ["rmp-btn", css].join(' '), "data-id": padIndex + ':' + (i + 1), onClick: clickHandler }, months.length > i ? months[i] : i));
            }))));
    };
    MonthPicker.prototype.render = function () {
        var pads = [];
        var popupClass = '';
        if (this.state.values.length > 1) {
            pads.push(this.optionPad(0), this.optionPad(1));
            popupClass = 'range';
        }
        else {
            pads.push(this.optionPad(0));
        }
        return (React.createElement("div", { className: ["month-picker", this.props.className].join(' ') },
            this.props.children,
            React.createElement("div", { className: ["rmp-container", "rmp-table", this.props.className, (this.state.showed ? "show" : '')].join(' ') },
                React.createElement("div", { className: "rmp-overlay", onTouchEnd: this._handleOverlayTouchTap }),
                React.createElement("div", { className: "rmp-cell" },
                    React.createElement("div", { className: ["rmp-popup", popupClass, this.props.theme, (this.state.showed ? "show" : '')].join(' ') }, pads)))));
    };
    MonthPicker.prototype.dismiss = function () {
        if (this.state.closeable) {
            this._onDismiss();
        }
    };
    MonthPicker.prototype.show = function () {
        this._onShow();
    };
    MonthPicker.prototype._handleOverlayTouchTap = function (e) {
        if (this.state.closeable) {
            this._onDismiss();
            this.props.onClickAway && this.props.onClickAway(e);
        }
    };
    MonthPicker.prototype._onShow = function () {
        var _this = this;
        setTimeout(function () { return _this.setState({ closeable: true }); }, 250);
        this.setState({ showed: true });
        this.props.onShow && this.props.onShow();
    };
    MonthPicker.prototype._onDismiss = function (s) {
        this.setState(Object.assign({ showed: false, loading: false }, s));
        this.props.onDismiss && this.props.onDismiss(this.value());
    };
    MonthPicker.prototype.handleClickMonth = function (e) {
        if (this.state.showed) {
            var refid = this.getDID(e).split(':'), idx = parseInt(refid[0], 10), month = parseInt(refid[1], 10), year = this.state.labelYears[idx], values = this.state.values;
            values[idx] = { year: year, month: month };
            this.setState({ values: values });
            this.props.onChange(year, month, idx);
        }
    };
    MonthPicker.prototype.goPrevYear = function (e) {
        var idx = parseInt(this.getDID(e), 10);
        if (this.state.yearIndexes[idx] > 0) {
            this.setYear(idx, -1);
        }
    };
    MonthPicker.prototype.goNextYear = function (e) {
        var idx = parseInt(this.getDID(e), 10);
        if (this.state.yearIndexes[idx] < (this.state.years.length - 1)) {
            this.setYear(idx, 1);
        }
    };
    MonthPicker.prototype.setYear = function (idx, step) {
        var yearIndex = (this.state.yearIndexes[idx] += step), labelYears = this.state.labelYears, theYear = this.state.years[yearIndex].year;
        labelYears[idx] = theYear;
        this.setState({
            labelYears: labelYears
        });
        this.props.onYearChange && this.props.onYearChange(theYear);
    };
    MonthPicker.prototype.getDID = function (e) {
        var el = e.target;
        return el.dataset ? el.dataset.id : el.getAttribute('data-id');
    };
    MonthPicker.prototype._reset = function () {
        var values = this.validValues(this.state.lastRange || this.state.lastValue, this.state.years, this.state.yearIndexes);
        return { values: values };
    };
    MonthPicker.prototype._keyDown = function (e) {
        if (!this.state.showed)
            return;
        if (e.key === 'Escape') {
            this._onDismiss(this._reset());
            e.stopPropagation();
        }
        else if (e.key === 'Enter') {
            this._onDismiss();
            e.stopPropagation();
        }
        else if (this.state.values.length === 1) {
        }
    };
    MonthPicker.defaultProps = {
        years: getYearsByNum(5),
        onChange: function (year, month, idx) { },
        theme: 'light',
        show: false,
    };
    return MonthPicker;
}(React.Component));
exports.default = MonthPicker;
//# sourceMappingURL=month-picker.js.map