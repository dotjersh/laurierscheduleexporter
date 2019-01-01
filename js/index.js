window.onload = function() {
  $('.input-daterange').datepicker({});
}

function scrape() {
  // a few basic variables to start
  var dayOfWeek = ["S", "M", "T", "W", "R", "F", "S"];
  var types = {
    "LEC": "Lecture",
    "LAB": "Lab"
  };
  var today = new Date();

  // start the file contents
  var result = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:" +
    today.getFullYear() +
    doubleDigit(today.getMonth() + 1) +
    doubleDigit(today.getDate()) + "T" +
    doubleDigit(today.getHours()) +
    doubleDigit(today.getMinutes()) +
    "00\n";

  // get the data the user put into the textbox and render it into HTML inside the hidden div
  select("#schedule").innerHTML = select("#source").value;

  // make sure a table actually exists
  if (!select("#schedule tbody")) {
    error("Make sure you are logged in");
    return;
  }

  // loop through every row in the table
  selectAll("#schedule tbody tr").forEach(function(row) {
    var startDay = new Date(select("#startDate").value);
    var endDay = new Date(select("#endDate").value);

    // Array in the order: [0]course, [1] class type, [2]days, [3]time, [4]building, [5]instructor
    var data = [];

    // fill out data array with the information we need to create the calendar
    row.childNodes.forEach(function(cell) {
      if (cell.nodeName == "TD") {
        data.push(cell.textContent.trim());
      }
    });

    //parse the time so we have a start and end time
    data[3] = [data[3].split("-")[0].trim(), data[3].split("-")[1].trim()];

    //create events
    var dateVar = startDay;

    while (dateVar.getTime() <= endDay.getTime()) {
      console.log(dayOfWeek[dateVar.getDay()]);
      if (data[2].indexOf(dayOfWeek[dateVar.getDay()]) >= 0) {
        result = result +
          "BEGIN:VEVENT\n" +
          "DTSTAMP:" + today.getFullYear() + doubleDigit(today.getMonth() + 1) + doubleDigit(today.getDate()) + "T" + doubleDigit(today.getHours()) + doubleDigit(today.getMinutes()) + "00\n" +
          "UID:" + dateVar.getFullYear() + doubleDigit(dateVar.getMonth() + 1) + doubleDigit(dateVar.getDate()) + "T" + formatTime(data[3][0]) + data[0] + "\n" +
          "DTSTART:" + dateVar.getFullYear() + doubleDigit(dateVar.getMonth() + 1) + doubleDigit(dateVar.getDate()) + "T" + formatTime(data[3][0]) + "00\n" +
          "DTEND:" + dateVar.getFullYear() + doubleDigit(dateVar.getMonth() + 1) + doubleDigit(dateVar.getDate()) + "T" + formatTime(data[3][1]) + "00\n" +
          "SUMMARY:" + data[0] + " " + types[data[1]] + "\n" +
          "LOCATION:" + data[4].substring(2) + "\n" +
          "END:VEVENT\n";
      }

      /* set the date for the next ireration of the loop */
      dateVar.setDate(dateVar.getDate() + 1);
    }
  });

  /* Now download the file */
  download("LaurierSchedule.ics", result + "END:VCALENDAR");
  success("Completed");
}

function no() {
  /* start splitting the string by table */
  var tables = html.split("<table");
  var course = "";

  /* first loop: loop through every table on the page */
  for (var i = 1; i < tables.length; i = i + 1) {
    var data = "";

    /* check to see if the course is enrolled */
    if (tables[i].indexOf(
        'This layout table is used to present the schedule course detail') > 0) {
      if (tables[i].indexOf('**Enrolled**') >= 0) {
        course = tables[i].split(' - ')[1];
      } else {
        course = null;
      }
    } else if (tables[i].indexOf(
        'This table lists the scheduled meeting times and assigned instructors for this class..'
      ) > 0 && course != null) {
      /* parse information for the class as a whole*/
      var details = tables[i].split('<tr>')[2].split('<td CLASS=\"dddefault\">');
      course = course + " - " + details[6].split('</td')[0];
      var place = details[4].split('</td')[0];
      var startTime = details[2].split(' - ')[0];
      var endTime = details[2].split(' - ')[1].split('</td')[0];
      var days = details[3].split('</td')[0];
      var start = new Date(details[5].split(' - ')[0]);
      var end = new Date(details[5].split(' - ')[1].split('</td')[0]);

      /* loop variable */
      var dateVar = start;

      /* second loop: save each class time as a new event in the new calendar */
      while (dateVar.getTime() <= end.getTime()) {
        if (days.indexOf(dayOfWeek[dateVar.getDay()]) >= 0) {
          result = result +
            "BEGIN:VEVENT\n" +
            "DTSTAMP:" + today.getFullYear() + doubleDigit(today.getMonth() + 1) +
            doubleDigit(today.getDate()) + "T" + doubleDigit(today.getHours()) +
            doubleDigit(today.getMinutes()) + "00\n" +
            "UID:" + dateVar.getFullYear() + doubleDigit(dateVar.getMonth() + 1) +
            doubleDigit(dateVar.getDate()) + "T" + formatTime(startTime) +
            course.replace(' ', '').split(" - ")[0] + "\n" +
            "DTSTART:" + dateVar.getFullYear() + doubleDigit(dateVar.getMonth() +
              1) + doubleDigit(dateVar.getDate()) + "T" + formatTime(startTime) +
            "00\n" +
            "DTEND:" + dateVar.getFullYear() + doubleDigit(dateVar.getMonth() +
              1) + doubleDigit(dateVar.getDate()) + "T" + formatTime(endTime) +
            "00\n" +
            "SUMMARY:" + course + "\n" +
            "LOCATION:" + place + "\n" +
            "END:VEVENT\n";
        }

        /* set the date for the next ireration of the loop */
        dateVar.setDate(dateVar.getDate() + 1);
      }
    }
  }

}
