import {Button, Typography} from "@mui/material";
import ReactDOM from "react-dom/client";
import {getSemesterEventData} from "@/lib/semesterEventDataHandler.ts";
import {weekdayFromAbbreviation} from "@/type/weekday.ts";
import {addDay, toStr} from "@/lib/timeHandler.ts";
import {genCalendarCSV, generateCSV} from "@/lib/google-calendar.ts";
import Event from "@/type/event.ts"

class CourseInfo {
    constructor(
        public code: string,
        public title: string,
        public semester: string,
        public startDate: Date,
        public endDate: Date,
        public classes: Class[],
        public college: string,
        public location: string,
        public professor: string
    ) {
    }
}

class ParseSemesterAndStartEndDateStrRes {
    constructor(
        public semester: string,
        public startDate: Date,
        public endDate: Date
    ) {
    }
}

/**
 * parse the string contain both term and start, end day of the course.
 * @param str example: 2025 Fall Term: Aug 26 - Dec 22
 * @return ParseSemesterAndStartEndDateStrRes
 */
function parseSemesterAndStartEndDateStr(str: string): ParseSemesterAndStartEndDateStrRes {
    console.log(str)
    const regex = /^(\d{4}) (Spring|Summer|Fall|Winter) Term: ([A-Za-z]+ \d{1,2}) - ([A-Za-z]+ \d{1,2})$/
    const match = str.match(regex);
    if (!match) throw new Error(`failed to parse term and start, end day string, string: ${str}`)

    console.log('match', match)
    const year = match[1]
    const season = match[2]
    const start = match[3]
    const end = match[4]

    const semester = `${season} ${year}`
    const startDate = new Date(`${start} ${year}`)
    const endDate = new Date(`${end} ${year}`)

    return {
        semester,
        startDate,
        endDate
    }
}


class Class {
    constructor(
        public day: number,
        public start: string,
        public end: string) {
    }
}


/**
 * parse the class information string to a list of classes each week.
 * @param str example:Mon : 2:30 PM to 5:25 PM   or   Tue, Thu : 9:55 AM to 11:10 AM
 *
 */
function parseClassStr(str: string): Array<Class> {
    const splits = str.split(' : ')
    const weekPart = splits[0]
    const weekdays = weekPart.split(',').map(s => weekdayFromAbbreviation(s.trim()))
    const timeRangePart = splits[1]
    const timeRangeSplits = timeRangePart.split('to').map(s => s.trim())
    const start = timeRangeSplits[0]
    const end = timeRangeSplits[1]
    return weekdays.map(weekday => {
        return new Class(weekday, start, end)
    })
}

function getCourses() {
    const courseBoxes = document.querySelectorAll('.course_box')
    const courses = new Map<string, CourseInfo>()
    for (let i = 0; i < courseBoxes.length; i++) {
        const courseBox = courseBoxes[i]
        // The .course_title actually is ENG 2150T, I would like to call it code, since Writing II is the actual title.
        const code = courseBox.querySelector('.course_title')!.textContent!;
        const divs = courseBox.querySelectorAll('.header_cell>div')
        // ex:  2025 Fall Term: Aug 26 - Dec 22
        const semesterAndStartEndDateStr = divs[0].textContent!
        const parseSemesterAndStartEndDayRes = parseSemesterAndStartEndDateStr(semesterAndStartEndDateStr)
        const courseSemester = parseSemesterAndStartEndDayRes.semester
        const startDate = parseSemesterAndStartEndDayRes.startDate
        const endDate = parseSemesterAndStartEndDayRes.endDate
        // ex: 1-Writing II
        const title = divs[2].textContent!.split('-')[1]
        console.log("title", title)
        // ex: Mon : 2:30 PM to 5:25 PM   or   Tue, Thu : 9:55 AM to 11:10 AM
        const classesStr = divs[4].textContent!.trim()
        const classes = parseClassStr(classesStr)
        const tds = courseBox.querySelectorAll('td')
        const divsUnderTds = tds[4].querySelectorAll('div')
        const college = divsUnderTds[0].textContent!
        const location = divsUnderTds[2].textContent!.trim()
        const professor = divsUnderTds[3].textContent!

        const courseInfo = new CourseInfo(
            code,
            title,
            courseSemester,
            startDate,
            endDate,
            classes,
            college,
            location,
            professor
        )

        courses.set(code, courseInfo)
    }
    return courses
}

export default defineContentScript({
    matches: ['https://sb.cunyfirst.cuny.edu/criteria.jsp*'],
    main(ctx) {
        console.log("content script loading")
        const ui = createIntegratedUi(ctx, {
            tag: 'span',
            position: 'inline',
            anchor: '.bottom-buttons>div',
            onMount: (container) => {
                console.log('mount', container);

                const generateSchedule = function () {
                    const courses = getCourses();

                    // get academic calendar data
                    getSemesterEventData().then(data => {
                        let earliest: (Date | null) = null
                        let latest: (Date | null) = null
                        const semester = document.querySelector('.autho_text.header_invader_text_top.active-term-label')!.textContent!
                        const noScheduleDates = data.getNoScheduleDates(semester)

                        class ClassWithCode extends Class {
                            constructor(public courseCode: string, class_: Class) {
                                super(class_.day, class_.start, class_.end);
                            }
                        }

                        // week schedule.ignore the range of each class, generate a table of weekly schedule.
                        const weekSchedule = new Array<Array<ClassWithCode>>(7)
                        for (let i = 0; i < 7; i++) {
                            weekSchedule[i] = new Array<ClassWithCode>()
                        }
                        console.log(courses)
                        // iterate all the courses
                        courses.forEach(course => {
                            if (!earliest || !latest) {
                                earliest = course.startDate
                                latest = course.endDate
                            } else {
                                if (earliest.getTime() > course.startDate.getTime()) {
                                    earliest = course.startDate
                                }
                                if (latest.getTime() < course.endDate.getTime()) {
                                    latest = course.endDate
                                }
                            }
                            course.classes.forEach(class_ => {
                                weekSchedule[class_.day].push(new ClassWithCode(course.code, class_));
                            })
                        })
                        if (courses.size === 0) {
                            throw new Error('No course was detected from the webpage, can not export the calendar file.')
                        }

                        const classEachDay = new Map<string, Array<ClassWithCode>>()
                        // iterate every single day.
                        for (let d: Date = earliest!; d <= latest!; d = addDay(d, 1)) {
                            console.log(noScheduleDates.indexOf(toStr(d)) === -1)
                            console.log(toStr(d))
                            // if this date is in no schedule dates, just ignore it.
                            if (noScheduleDates.indexOf(toStr(d)) !== -1) continue
                            classEachDay.set(d.toLocaleDateString('en-US'), weekSchedule[d.getDay()])
                        }

                        const changes = data.getCourseChanges(semester)
                        console.log("changes", changes)
                        for (const [date, week] of changes.entries()) {
                            classEachDay.set(date, weekSchedule[week])
                        }
                        const allEvents = new Array<Event>()
                        classEachDay.forEach((classes, dateString) => {
                            const d = new Date(dateString)
                            console.log(classes)
                            classes.forEach(class_ => {
                                const course = courses.get(class_.courseCode)!

                                // we need to make sure that the class is in the time range of these courses
                                if (d.getTime() < course.startDate.getTime() || d.getTime() > course.endDate.getTime()) {
                                    return
                                }
                                // create date object by generating the time string, like 10/12/2025 10:12 AM
                                const startDateTime = new Date(`${d.toDateString()} ${class_.start}`)
                                const endDateTime = new Date(`${d.toDateString()} ${class_.end}`)
                                const event = new Event(
                                    course.code,
                                    startDateTime,
                                    endDateTime,
                                    {
                                        location: course.location,
                                        description: course.title,
                                    }
                                )
                                allEvents.push(event)
                            })
                        })

                        genCalendarCSV(allEvents, "calendar.csv")
                    })
                    console.log(courses)
                }

                // Append children to the container
                const app = (
                    <Button
                        onClick={generateSchedule}
                        size={'large'}
                        sx={{
                            '&:hover': {
                                backgroundColor: '#ededed',    // on hover
                            },
                        }}>
                        <Typography
                            sx={{
                                color: 'black',
                                fontWeight: '500',
                                fontSize: '14px',
                            }}> Export </Typography>
                    </Button>
                )
                const root = ReactDOM.createRoot(container)
                root.render(app)
            },
        });

        // Call mount to add the UI to the DOM
        ui.mount();
    },
});
