//to ease writing
function select(i) {
  return document.querySelector(i);
};

//to make life easier
function selectAll(i) {
  return document.querySelectorAll(i);
};

/* Convert single digit number to double digit number*/
function doubleDigit(val) {
  val = String(val);
  if (val.length <= 1) {
    val = "0" + val;
  }

  return val;
}

/* format time for .ics file type */
function formatTime(time) {
  var hour = parseInt(time.split(':')[0]);
  var min = parseInt(time.split(':')[1]);

  if (time.indexOf('pm') >= 0 && hour < 12) {
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

/* display an alert */
function notify(message) {
  select("#alert").innerHTML = message;
  select("#alert").className = "alert alert-primary";
}

/* display a success message */
function success(message) {
  select("#alert").innerHTML = message;
  select("#alert").className = "alert alert-success";
}

/* display an error */
function error(message) {
  select("#alert").innerHTML = "<b>Error: " + message + "</b><br>If you believe this is in error, please submit an issue on <a href='https://github.com/dotjersh/lorisexporter/issues/new'>github</a>.";
  select("#alert").className = "alert alert-danger";
}
