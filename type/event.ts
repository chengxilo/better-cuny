// A class map to the Google Calendar csv file requirement.
class Event {
    public startDate: string;
    public startTime: string;
    public endDate: string;
    public endTime: string;
    public location: string;
    public description: string;
    public allDayEvent: boolean;
    public private_: boolean;

    constructor(
        public subject: string,
        startDateTime: Date,
        endDateTime: Date,
        opts: {
            location?: string;
            description?: string;
            allDayEvent?: boolean;
            private_?: boolean;
        } = {}
    ) {
        this.location = opts.location ?? "";
        this.description = opts.description ?? "";
        this.allDayEvent = opts.allDayEvent ?? false;
        this.private_ = opts.private_ ?? false;
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "numeric",
            hour12: true,
            minute: "2-digit",
        }
        const parse = (date: Date) => {
            const pattern = /^(\d+\/\d+\/\d{4}), (\d+:\d+ (AM|PM))$/
            const dateStr = date.toLocaleDateString("en-US", options);
            const matches = dateStr.match(pattern)
            return {
                date: matches![1],
                time: matches![2],
            }
        }
        const startParseRes = parse(startDateTime);
        const endParseRes = parse(endDateTime);
        this.startDate = startParseRes.date;
        this.startTime = startParseRes.time;
        this.endDate = endParseRes.date;
        this.endTime = endParseRes.time;
    }
}

export default Event;