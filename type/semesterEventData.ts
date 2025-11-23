import {weekdayFromFullName} from "@/type/weekday.ts";

export class SemesterEventData {
    private readonly semesterEvent: { [p: string]: { [p: string]: Array<string> } };
    private readonly createdAt: string;

    constructor(semesterEvent: { [key: string]: { [key: string]: Array<string> } }, createdAt: Date) {
        this.semesterEvent = semesterEvent
        this.createdAt = createdAt.toISOString()
    }

    // generate a new semester event data for storage
    public static new(semesterEvent: { [p: string]: { [p: string]: Array<string> } }) {
        return new SemesterEventData(semesterEvent, new Date())
    }

    public getCreatedAt(): Date {
        return new Date(this.createdAt)
    }

    public getSemesterEvent() {
        return this.semesterEvent;
    }

    /**
     * get those no-schedule dates.
     * @param semester example: Spring 2025
     * @return string[] a list of no-schedule date, element example: 04/19/2025
     */
    public getNoScheduleDates(semester: string) {
        console.log("get no schedule dates");
        console.log(semester);
        console.log(this.getSemesterEvent())
        const result = []
        for (const [date, events] of Object.entries(this.getSemesterEvent()[semester])) {
            console.log(`${date} ${events}`);
            for (const event of events) {
                console.log(`${event}: ${JSON.stringify(event)}`);
                console.log(event.toLowerCase())

                if (["no classes scheduled", "college closed", "spring recess"].includes(event.toLowerCase())) {
                    result.push(date);
                }
            }
        }
        return result
    }

    /**
     * get course-change dates
     * @param semester example: Spring 2025
     * @return Map, key: date, value: number
     */
    public getCourseChanges(semester: string): Map<string, number> {
        const result = new Map<string, number>()
        console.log("Get course changes");
        console.log(semester)
        console.log(this.getSemesterEvent())
        console.log(Object.entries(this.getSemesterEvent()[semester]))
        for (const [date, events] of Object.entries(this.getSemesterEvent()[semester])) {
            for (const event of events) {
                // there is a substring follow in the schedule
                if (event.indexOf("follow") !== -1) {
                    // possible event string:
                    // Classes follow a Monday schedule
                    // Classes follow Wednesday schedule
                    const pattern = /.*?follow.*?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday).*?$/
                    const followWeek = event.match(pattern)![1]
                    const weekday = weekdayFromFullName(followWeek)
                    result.set(date, weekday)
                }
            }
        }
        return result
    }
}