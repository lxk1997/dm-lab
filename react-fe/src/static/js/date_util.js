var now = new Date(); // 当前日期
var nowDayOfWeek = now.getDay(); // 今天本周的第几天
var nowDay = now.getDate(); // 当前日
var nowMonth = now.getMonth(); // 当前月
var nowYear = now.getYear(); // 当前年
nowYear += (nowYear < 2000) ? 1900 : 0;

export class DateUtil {
	/**
	 * 获得当前日期
	 *
	 * @returns
	 */
	getNowDay = () => {
		return this.formatDate(new Date());
	}
	/**
	 * 获得本周的开始时间
	 *
	 * @returns
	 */
	getStartDayOfWeek = () => {
		var day = nowDayOfWeek || 7;
		return this.formatDate(new Date(now.getFullYear(), nowMonth, nowDay + 1 - day));
	}
	/**
	 * 获得本周的结束时间
	 *
	 * @returns
	 */
	getEndDayOfWeek = () => {
		var day = nowDayOfWeek || 7;
		return this.formatDate(new Date(now.getFullYear(), nowMonth, nowDay + 7 - day));
	}
	/**
	 * 获得本月的开始时间
	 *
	 * @returns
	 */
	getStartDayOfMonth = () => {
		var monthStartDate = new Date(nowYear, nowMonth, 1);
		return this.formatDate(monthStartDate);
	}
	/**
	 * 获得本月的结束时间
	 *
	 * @returns
	 */
	getEndDayOfMonth = () => {
		var monthEndDate = new Date(nowYear, nowMonth, this.getMonthDays());
		return this.formatDate(monthEndDate);
	}
	/**
	 * 获得本月天数
	 *
	 * @returns
	 */
	getMonthDays = () => {
		var monthStartDate = new Date(nowYear, nowMonth, 1);
		var monthEndDate = new Date(nowYear, nowMonth + 1, 1);
		var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
		return days;
	}
	/**
	 * 获得当前季度
	 *
	 * @returns
	 */
	getQuarter = () => {
		switch (nowMonth) {
			case 1:
			case 2:
			case 3:
				return now.getFullYear() + '-01-01 ~ ' + now.getFullYear() + '-03-31'
			case 4:
			case 5:
			case 6:
				return now.getFullYear() + '-04-01 ~ ' + now.getFullYear() + '-06-30'
			case 7:
			case 8:
			case 9:
				return now.getFullYear() + '-07-1 ~ ' + now.getFullYear() + '-09-30'
			case 10:
			case 11:
			case 12:
				return now.getFullYear() + '-10-01 ~ ' + now.getFullYear() + '-12-31'

		}
	}
	/**
	 * @param 日期格式化
	 * @returns {String}
	 */
	formatDate = date =>{
		var myyear = date.getFullYear();
		var mymonth = date.getMonth() + 1;
		var myweekday = date.getDate();

		if (mymonth < 10) {
			mymonth = "0" + mymonth;
		}
		if (myweekday < 10) {
			myweekday = "0" + myweekday;
		}
		return (myyear + "-" + mymonth + "-" + myweekday);
	}
}