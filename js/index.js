function scrape(){
  /* a few basic variables to start */
  var dayOfWeek = ["S","M","T","W","R","F","S"];
  var today = new Date();

  /* start the file contents */
  var result = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:" +
      today.getFullYear() + doubleDigit(today.getMonth()+1) + doubleDigit(today.getDate()) + "T" + doubleDigit(today.getHours()) + doubleDigit(today.getMinutes())  + "00\n";

  /* get the data the user put into the textbox and get rid of a lot of the sensative details */
  var html = $('.text').val().split('<div class="pagebodydiv">')[1].split('</DIV>')[0];

  /* start splitting the string by table */
  var tables = html.split("<table");
  var course = "";

  /* first loop: loop through every table on the page */
  for(var i = 1; i < tables.length; i = i + 1){
    var data = "";

    /* check to see if the course is enrolled */
    if(tables[i].indexOf('This layout table is used to present the schedule course detail') > 0){
      if(tables[i].indexOf('**Enrolled**') >= 0){
        course = tables[i].split(' - ')[1];
      } else {
        course = null;
      }
    } else if(tables[i].indexOf('This table lists the scheduled meeting times and assigned instructors for this class..') > 0 && course != null){
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
      while(dateVar.getTime() <= end.getTime()){
        if(days.indexOf(dayOfWeek[dateVar.getDay()]) >= 0){
          result = result +
          "BEGIN:VEVENT\n" +
            "DTSTAMP:" + today.getFullYear() + doubleDigit(today.getMonth()+1) + doubleDigit(today.getDate()) + "T" + doubleDigit(today.getHours()) + doubleDigit(today.getMinutes())  + "00\n" +
            "UID:" + dateVar.getFullYear() + doubleDigit(dateVar.getMonth()+1) + doubleDigit(dateVar.getDate()) + "T" + formatTime(startTime) + course.replace(' ','').split(" - ")[0] + "\n" +
            "DTSTART:" + dateVar.getFullYear() + doubleDigit(dateVar.getMonth()+1) + doubleDigit(dateVar.getDate()) + "T" + formatTime(startTime) + "00\n" +
            "DTEND:"+ dateVar.getFullYear() + doubleDigit(dateVar.getMonth()+1) + doubleDigit(dateVar.getDate()) + "T" + formatTime(endTime) + "00\n" +
            "SUMMARY:"+ course + "\n" +
            "LOCATION:"+ place + "\n" +
          "END:VEVENT\n";
        }

        /* set the date for the next ireration of the loop */
        dateVar.setDate(dateVar.getDate() + 1);
      }
    }
  }

  /* Now download the file */
  download("LaurierSchedule.ics",result + "END:VCALENDAR");
}

/* Utilities */
  /* Convert single digit number to double digit number*/
  function doubleDigit(val){
    val = String(val);
    if(val.length <= 1){
      val = "0" + val;
    }

    return val;
  }

  /* format time for .ics file type */
  function formatTime(time){
    var hour = parseInt(time.split(':')[0]);
    var min = parseInt(time.split(':')[1]);

    if(time.indexOf('pm') >= 0 && hour < 12){
      hour = hour + 12;
    }

    return doubleDigit(hour) + doubleDigit(min);
  }

  /* forces the download of the ics file after it's been created*/
  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
