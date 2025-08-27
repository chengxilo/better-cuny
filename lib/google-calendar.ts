import Event from "@/type/event.ts"
function genCalendarCSV(events : Event[], filename: string) : void {
    const headers = ["Subject", "Start Date", "Start Time", "End Date", "End Time", "Description", "Location", "All Day Event"]
    // parse all events to csv file.
    const content = events.map(value => ({
        "Subject": value.subject,
        "Start Date": value.startDate,
        "Start Time": value.startTime,
        "End Date": value.endDate,
        "End Time": value.endTime,
        "Description": value.description,
        "Location": value.location,
        "All Day Event": value.allDayEvent
    }))
    generateCSV(content, headers, filename)
}

function generateCSV(data: any[], headers: string[], filename: string) {
    const csvContent = [
        headers.join(','), // header row
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(',')) // data rows
    ].join('\r\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

export {generateCSV, genCalendarCSV};