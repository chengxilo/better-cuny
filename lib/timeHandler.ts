// it will parse the range to multiple single days.
const fromStr = function (str: string): Date {
    const subs = str.split('/')
    const month = Number(subs[0]);
    const day = Number(subs[1]);
    const year = Number(subs[2]);
    // month - 1 is because the second parameter is monthIndex, range 0 - 11
    return new Date(year, month - 1, day)
}
const addDay = function(date: Date, days : number = 1) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}
const toStr = (date: Date) => {
    const month_str = (date.getMonth() + 1).toString().padStart(2, '0');
    const day_str = date.getDate().toString().padStart(2, '0');
    const year_str = date.getFullYear().toString();
    return `${month_str}/${day_str}/${year_str}`
}
export {fromStr, addDay, toStr};