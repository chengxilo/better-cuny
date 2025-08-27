// semester event key
import {SemesterEventData} from "@/type/semesterEventData.ts";
import {addDay, fromStr, toStr} from "@/lib/timeHandler.ts";
import axios from "axios";
import * as cheerio from 'cheerio';
import {Element} from "domhandler";

const semesterEventStorageKey = "local:semesterEvents"

/**
 * Get semester event data from  'https://www.cuny.edu/academics/academic-calendars/';
 * @return SemesterEventData
 */
async function getSemesterEventData(): Promise<SemesterEventData> {
    console.log("getSemesterEventData");
    const rawData = await storage.getItem<SemesterEventData>(semesterEventStorageKey)
    console.log('raw data: ', rawData)
    if (rawData) {
        // if we can not get a valid created_at time, new Date(0) make sure the value would be 1700-01-01
        // so it must be treated as expired and would fetch the new data.
        const semesterEventDataInStorage = Object.assign(new SemesterEventData({}, new Date(0)), rawData)
        const createdAt = semesterEventDataInStorage.getCreatedAt()

        console.log("createdAt: ", createdAt)
        // if data exists, check whether it is expired
        // if it is not expired, we can stop here. we use 7 day after it is created as expire date
        const expireAt = addDay(createdAt, 7)
        if (expireAt.getTime() > new Date().getTime()) {
            // not expired
            // we don't need to execute the code block after this.
            console.log("semester event data not expired.");
            return semesterEventDataInStorage
        }
        console.log("semester event expired or not exists, will fetch new data.");
    }


    const semesterEvent = await new Promise<any>((resolve, reject) => {
        browser.runtime.sendMessage({action: "fetchCUNYCalendar"}, (response) => {
            if (browser.runtime.lastError) {
                reject(new Error(browser.runtime.lastError.message));
            } else if (response.error) {
                reject(new Error(response.error));
            } else {
                resolve(response.semesterEvent);
            }
        });
    });
    console.log("semester event data", semesterEvent)
    const newSemesterEventData = SemesterEventData.new(semesterEvent);
    await setSemesterEventData(newSemesterEventData);
    return newSemesterEventData;
}

async function setSemesterEventData(data: SemesterEventData): Promise<void> {
    await storage.setItem<SemesterEventData>(semesterEventStorageKey, data)
}

class TableRow {
    date_str: string;
    description: string;

    constructor(date_str: string, description: string) {
        this.date_str = date_str;
        this.description = description;
    }
}

/**
 * Parse tableRow array to events map.
 * @param tableRows tableRow array extracted from web page.
 */
function parseRowsToEvents(tableRows : TableRow[]): { [key: string]: Array<string> } {
    const events: { [key: string]: Array<string> } = {};
    tableRows.forEach((row) => {
        // Possible values for date_str 09/16/2025 or 09/22/2025-09/24/2025
        const date_str = row.date_str;
        console.log(date_str);
        const description = row.description;
        const description_splits = description.split('\n');
        // two different kind of value
        if (/[–-]/.test(date_str)) {
            // time range, like 09/22/2025-09/24/2025
            const lis = date_str.split(/[–-]/).map(e => e.trim());
            const start = fromStr(lis[0]);
            const end = fromStr(lis[1])
            for (let d = start; d.getTime() <= end.getTime(); d = addDay(d)) {

                if (toStr(d) in events) {
                    events[toStr(d)] = [...events[toStr(d)], ...description_splits];
                } else {
                    events[toStr(d)] = description_splits
                }
            }
        } else {
            // one single day, like 09/16/2025
            if (date_str in events) {
                events[date_str] = [...events[date_str], ...description_splits]
            } else {
                events[date_str] = description_splits
            }
        }
    });
    return events;
}

/**
 * Parse an academic calendar table into a map of events.
 * @param $ The Cheerio API instance used for DOM traversal
 * @param table The table element selected via Cheerio
 * @returns An object where keys are date strings (MM/DD/YYYY) and values are arrays of event descriptions
 */
function parseCalendarTable($: cheerio.CheerioAPI, table: Element): { [key: string]: Array<string> } {
    const tableRows = $(table).find('tr').map(function (_, tr) {
        const tds = $(tr).find('td');
        if (tds.length < 3) return null
        const date_str = $(tds[0]).text().trim();
        const description = $(tds[2]).text().trim();
        return new TableRow(date_str, description);
    }).toArray().filter((row) => row != null);

    return parseRowsToEvents(tableRows)
}

// fetch the cuny calendar web page, and use cheerio to extract those information we need.
async function fetchCUNYCalendar(): Promise<{ [key: string]: { [key: string]: Array<string> } } | undefined> {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    };
    const url = 'https://www.cuny.edu/academics/academic-calendars/';
    const response = await axios.get(url, {headers});
    if (response.status !== 200) {
        throw Error(`cannot get CUNY calendar successfully: status ${response.status} ,data: ${response.data}`);
    }

    const $ = cheerio.load(response.data);

    const tableTitles: string[] = [];
    $('.cuny-section-header').each((_, el) => {
        const semesterPart = $(el).text().split(':')[1].trim()
        const splits = semesterPart.split(' ')
        tableTitles.push(`${splits[1]} ${splits[0]}`);
    });

    const semesterEvents: { [key: string]: { [key: string]: Array<string> } } = {};
    $('table').each((index, table) => {
        semesterEvents[tableTitles[index]] = parseCalendarTable($, table);
    });
    console.log("semester events: ", semesterEvents);
    return semesterEvents
}

export {getSemesterEventData, fetchCUNYCalendar, parseCalendarTable, parseRowsToEvents, TableRow};