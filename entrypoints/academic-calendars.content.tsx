import {IconButton} from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReactDOM from "react-dom/client";
import {parseRowsToEvents, TableRow} from "@/lib/semesterEventDataHandler.ts";
import {genCalendarCSV} from "@/lib/google-calendar.ts";
import Event from "@/type/event.ts"

const parseTable = (tableElement: HTMLElement) => {
    const rows = tableElement.querySelectorAll('tr');
    console.log("rows", rows);
    const rs = Array.from(rows).map(row =>  {
        const tds = row.getElementsByTagName('td');
        if (tds.length < 3) return;
        const date_str = tds[0].textContent.trim();
        const description = tds[2].textContent.trim();
        return new TableRow(date_str, description);
    }).filter(Boolean) as TableRow[];
    return parseRowsToEvents(rs)
}

const genAcademicCalendar = (title: string, tableEle: HTMLElement) => {
    console.log(`generate academic calendar of ${title}`);
    const parsedEvents = parseTable(tableEle)
    const events: Event[] = [];

    for (const [date, es] of Object.entries(parsedEvents)) {
        for (const e of es) {
            console.log("push")
            events.push(new Event(e, new Date(date), new Date(date), {
                allDayEvent: true
            }))
        }
    }

    genCalendarCSV(events, title + '.csv')
}

export default defineContentScript({
    // Set manifest options
    matches: ["https://www.cuny.edu/academics/academic-calendars/"],

    main(ctx) {
        // mount export button to the title of each table of academic calendar.
        const headers = document.querySelectorAll<HTMLElement>(".cuny-section-header")

        headers.forEach(header => {
            header.style.alignItems = "center"
            header.style.display = "flex"
            header.style.flexDirection = "row"
            header.style.justifyContent = "space-between"
            const ui = createIntegratedUi(ctx, {
                tag: 'span',
                position: 'inline',
                anchor: header,
                onMount: (container) => {
                    const app = (
                        <IconButton
                            onClick={()=>{
                                // get the next element of header(table)
                                const table: Element = header.nextElementSibling!
                                genAcademicCalendar(header.textContent, table as HTMLElement)
                            }}
                            size={'small'}
                            sx={{
                                color: "white",
                                borderColor: 'white',
                                backgroundColor: '#0235a2',
                                '&:hover': {
                                    backgroundColor: 'white',    // on hover
                                    color: '#0235a2'
                                },
                            }}>
                            <FileDownloadIcon
                                sx={{
                                    color: 'inherit !important'
                                }} />
                        </IconButton>
                    )
                    const root = ReactDOM.createRoot(container)
                    root.render(app)
                }
            });
            ui.mount();
        })
    }
});