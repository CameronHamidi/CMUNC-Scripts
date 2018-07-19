/*
Sends an email notification to it@cmunc.net and sg@cmunc.net when a delegation fills out the committee preference form
*/
function notify_form_submit(e) {
  var notification = "Dear all,\nThis is an automatic notification informing you that "
  + e.values[2] + ", delegation of " + e.values[5] +
  ", has just filled out the Committee/Position Preference form.\n\nYou can view the results of the form here: " + get_selection_form_url() + 
"\nYou can view the Committee Assignments sheet here: " + get_assignments_sheet_url() +
"\n\nYours sincerely,\n\n" + get_secretariat("tech") +
"\nDirector of Technology\nCornell Model United Nations Conference " + get_year() + "\nit@cmunc.net";
  var cc_addresses = "sg@cmunc.net";
  var subject = "Committee/Position Form Notification";
  var send_name = "Committee/Position Form Notification";
  MailApp.sendEmail("it@cmunc.net", subject, notification, {cc : cc_addresses, name : send_name});
}


/*
Returns the url for the preference form
*/
function get_selection_form_url(){
  return "https://docs.google.com/spreadsheets/d/1Vl1XMzS20bZ7rgknoQexiBkeuSW4tgVuBX3KxgfVG3c/"; //REPLACE THIS with the URL of the excel spreadsheet where the Committee/Position Preference responses are stored.
  //Omit all characters after and including the "/edit#grid="
}


/*
Returns the url for the assignments sheet
*/
function get_assignments_sheet_url(){
  return "https://docs.google.com/spreadsheets/d/13KzQ22e2ZH4fYFM27HIghUOMad7-Z3qvAuVq7FCZrco/"; //REPLACE THIS with the URL of the excel spreadsheet where the Committee Assignments are stored.
  //Omit all characters after and including the "/edit#grid="
}