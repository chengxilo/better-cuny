function weekdayFromAbbreviation(str: string): number {
    switch (str) {
        case "Mon":
            return 1;
        case "Tue":
            return 2;
        case "Wed":
            return 3;
        case "Thu":
            return 4;
        case "Fri":
            return 5;
        case "Sat":
            return 6;
        case "Sun":
            return 0;
        default:
            return -1;
    }
}

function weekdayFromFullName(str: string): number {
    switch (str) {
        case "Monday":
            return 1;
        case "Tuesday":
            return 2;
        case "Wednesday":
            return 3;
        case "Thursday":
            return 4;
        case "Friday":
            return 5;
        case "Saturday":
            return 6;
        case "Sunday":
            return 0;
        default:
            return -1;
    }
}

export {weekdayFromAbbreviation, weekdayFromFullName}