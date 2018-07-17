/*Automatically sends an email invoice whenever a delegate or delegation is registered

This is a script used to send an invoice through email whenever the "Registration Form CMUNC 2018" form is filled out.
This script takes into account both group and single registrations. In the case of a single delegate registration, the 
invoice is sent to whichever email address is listed as the advisor's email. It is important to keep in mind, when repurposing
this script for future CMUNCs, that the secretariat names (DG, Tech, Finance) and price variables (early registration fee, 
regular registration fee, late registration fee, transportation fee, deposit, and online pay fee) are all adjusted accordingly.

All data entered in a form is placed in the list e.values, occupying index 1 and indices 12 through 14,
as well as indices 2 through 7 for group registrations or indices 8 through 11 for single registrations.
Index 0 is a time stamp created automatically by Google Forms and used in some functions below.
Note that e.values is passed as an argument by myFunction() in ParseGroupDel() and parseSingleDel(), 
and is referred to simply as e in all other functions*/

/*Runs parsers for group and single delegation registrations

Calls function parseGroupDel(e) if a group was registered, and parseSingleDel(e) if a single delegate was registered.*/

function myFunction(e){
  //Logger.log("start");
  msgSend(e.values, "");
}
 

/*Sends the email

Calculates the total delegate cost, total transportation cost, and total cost. Composes the rest of the email,
including invoice PDF attachment, and sends it.
Also sends notification emails to dg@cmunc.net and finance@cmunc.net

e : The form response that this script is parsing
*/

function msgSend(e){
  
  var adv_name = "";
  var deposit_qty;
  var name;
  var email;
  var number;
  var msg;
  var first_name
  
  if (e[1] == "Group delegation"){
    name = e[2]; //The school being registered
    adv_name = e[4]; //The advisor's full name
    email = e[5]; //The advisor's primary email address
    number = e[7]; //The number of delegates being registered
    deposit_qty = 1
    first_name = get_first_name(adv_name); //The advisor's first name
    msg = "Dear " + first_name + ",\n\nThank you for registering " + name + " for CMUNC " + get_year.toString() + "."; //The salutations and first line of the email
  }
  else {
    name = e[9]; //The delegate's name
    email = e[11]; //The advisor's email address
    number = 1;
    deposit_qty = 0;
    first_name = get_first_name(name); //The delegate's first name
    msg = "Dear " + first_name + ",\n\nThank you for registering for CMUNC " + get_year.toString() + "."; //The salutations and first line of the email
  }
  
  var transportation_num; //The number of delegates who require transportation. 
  //Should either be 0, if transportation is not requested, or the number of delegates being registered
  if (e[13] == "Yes") {
    transportation_num = number;
  }
  else {
    transportation_num = 0;
  }
  
  var onlineFeeQty;
  if (deposit_qty == 1 && e[3] == "United States of America" && e[14] == "Online") { onlineFeeQty = 1;}
  else { onlineFeeQty = 0;}
  
  //
  var total = transportation_num * get_price("transport") + deposit_qty * get_price("deposit") + onlineFeeQty * get_price("online") + number * get_price(analyze_date(e[0]));
  
  var date = e[0].substring(0, e[0].indexOf(" "));
  var invoicePdf = createPdf(name, email, date, number, deposit_qty, transportation_num, onlineFeeQty);
  
  //Compose and send the emails to the delegate and secretariat

  var closing = "Yours sincerely,\n\n" + get_secretariat("tech") + "\nDirector of Technology\nCornell Model United Nations Conference " + get_year().toString() + "\nit@cmunc.net"; //The closing of the email
  
  var subject = "CMUNC " + get_year().toString() + " Registration Confirmation"; //The subject of the invoice email
  var msgOnlinePay;
  if (e[14] == "Online"){ 
    msgOnlinePay = " You will soon receive a PayPal payment request from finance@cmunc.net in order to pay your deposit. Please let us know if you prefer to pay by check.";
  }
  else { 
    msgOnlinePay = "";
  }
  var msgBody1 = " Attached to this email is your invoice." + msgOnlinePay + " Feel free to contact our Director-General, " + get_secretariat("director") + ", at dg@cmunc.net if you have any questions.\n\n";
  var school_plural = "s";
  if (number == 1){
    school_plural = "";
  }
  var msgBody2 = "You can expect more information regarding committee and position selection in the coming months. For now, we advise that you reserve your hotel room" + school_plural + " for the conference.";
  var msgBody3;  //Some additional information after the invoice
  if (e[1] == "Group delegation"){
    msgBody3 = " We look forward to seeing " + name + " during CMUNC 2018.\n\n";
  }
  else { msgBody3 = " We look forward to seeing you during CMUNC " + get_year().toString() + ".\n\n";}
  var message = msg + msgBody1 + msgBody2 + msgBody3 + closing; //All parts of the email concatenated together
  
  MailApp.sendEmail(email, subject, message, {
    name : "Cornell Model United Nations Conference",
    attachments : [invoicePdf]
  });
  Logger.log("email sent");
  secretariat_alert(name);

  //Write to the registration spreadsheet
  writeRegistration(e, name, email, number, deposit_qty, transportation_num, onlineFeeQty, total, adv_name);
}


/*Sends email alert to dg and finance*/
function secretariat_alert(name){
  if (name.toLocaleLowerCase() != "test"){
    var dgAlertSalutation = "Dear " + get_first_name(get_secretariat("director")) + ",\n\n";
    var financeAlertSalutation = "Dear " + get_first_name(get_secretariat("finance")) + ",\n\n";
    var alertBody1 = "This is an automatic notifcation informing you that " + name + " has registered for CMUNC " + get_year().toString() + ". Please visit ";
    var alertBody2 = "https://docs.google.com/spreadsheets/d/1Q70d85YejOKaTDSPeRaWmh5hJTsLDGqlh6ZND0e7lKY/edit#gid=52278867 to see the Registration spreadsheet.\n\nYours sincerley,\n\n" + get_secretariat("tech");
    var alert = alertBody1 + alertBody2;
    MailApp.sendEmail("dg@cmunc.net", "Registration Notification", dgAlertSalutation + alert, {name : "CMUNC Registration Notification"});
    MailApp.sendEmail("finance@cmunc.net", "Registration Notification", financeAlertSalutation + alert, {name : "CMUNC Registration Notification"});
  }
}
    

/*Fills in the Registration sheet

Fills in the columns of the Early Registration sheet, Regular Registation sheet, or Late Registration sheet of the Registration spreadsheet with the appropriate data

e : The form response that this script is parsing

name : The name of the school, or the name of the single delegate's advisor

advEmail : The advisor's email

numDels : The number of delegates being registered. 1 for single delegates

delegation_fee : The cost of delegate registration

delegate_fee : The per-delegate cost of registration

transport_fee : The total transportation cost

total : The total cost

deposit : The deposit paid by the delegation. Should be $100 for group delegations and $0 for single delegates*/

function writeRegistration(e, name, advEmail, numDels, deposit_qty, transport_qty, online_fee_qty, total, adv_name){
  var spreadsheet = SpreadsheetApp.openById("1Q70d85YejOKaTDSPeRaWmh5hJTsLDGqlh6ZND0e7lKY"); //Replace this string with the ID of the Google Spreadsheet you are working with. 
  //For example, given an URL https://docs.google.com/spreadsheets/d/1Q70d85YejOKaTDSPeRaWmh5hJTsLDGqlh6ZND0e7lKY/edit#gid=1821957846,
  //the ID is 1Q70d85YejOKaTDSPeRaWmh5hJTsLDGqlh6ZND0e7lKY.
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  
  var get_sheets_index; //The index of spreadsheet.getSheets() that will be edited. Index 1 corresponds to Early Registration,
  //index 2 corresponds to Regular Registration, and index 3 corresponds to Late Registration.
  var pricing_period = analyze_date(e[0], "period"); //The result of analyze_date(time_stamp, period), used in the following if, if-else, and else statements to determine which sheet to edit.
  if (pricing_period == "Early"){ get_sheets_index = 1;}
  else if (pricing_period == "Regular") {get_sheets_index = 2;}
  else {get_sheets_index = 3;}
  var registration_sheet = spreadsheet.getSheets()[get_sheets_index];
  
  var row = registration_sheet.getLastRow() + 1;
  
  var date_cell = registration_sheet.getRange(row, 1);
  date_cell.setValue(e[0]);
  
  var name_cell = registration_sheet.getRange(row, 2);
  name_cell.setValue(name);
  
  var advEmail_cell = registration_sheet.getRange(row, 3);
  advEmail_cell.setValue(advEmail);
  
  var numDels_cell = registration_sheet.getRange(row, 4);
  numDels_cell.setValue(numDels);
  
  var delegation_fee_cell = registration_sheet.getRange(row, 5);
  delegation_fee_cell.setValue("$" + deposit_qty * get_price("deposit") + ".00");
  
  var delegate_fee_cell = registration_sheet.getRange(row, 6);
  delegate_fee_cell.setValue("$" + numDels * get_price(pricing_period) + ".00");
  
  var transport_fee_cell = registration_sheet.getRange(row, 7);
  transport_fee_cell.setValue("$" + transport_qty * get_price("transport") + ".00");
  
  var online_pay_cell = registration_sheet.getRange(row, 8);
  online_pay_cell.setValue("$" + online_fee_qty * get_price("online") + ".00");

  var total_cell = registration_sheet.getRange(row, 9);
  total_cell.setValue("$" + total + ".00");
  
  var adv_name_cell = registration_sheet.getRange(row, 10);
  adv_name_cell.setValue(adv_name);
  Logger.log(adv_name);
  
  var paypal_yet_cell = registration_sheet.getRange(row, 12);
  if (e[14] == "Online") {
    paypal_yet_cell.setValue("No");      
    MailApp.sendEmail("it@cmunc.net", "Make Paypal Request", "Charge " + total + " to " + advEmail);
  }
  else { paypal_yet_cell.setValue("NA");}
}
