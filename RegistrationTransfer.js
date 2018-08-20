function transfer() {
  /*
  Transfers all unpaid Early/Regular delegations to Regular/Late pricing periods and sends them updated invoices.
  
  Depending on the current date, will either transfer all unpaid Early delegations to the Regular pricing period and send them updated invoices, or will transfer all unpaid Regular delegations to the Late period.
  Delegations are considered to be "unpaid" if the delegation has been entered in the sheet of the next pricing period (so delegations being moved from Early to Regular must be entered on the Regular sheet), with the
  following columns filled out: School, Advisor email, # of Delegates, Delegation Fee, Delegate Fee, Transportation Fee, Online Pay Fee, Total Due, Advisor Name, and Regular (or Late) Transfer? ("Filled out as "Yes").
  The function will update the delegation's information in the spreadsheet, update the delegation's invoice, and email the new invoice to the delegation.
  */
  var invoiceFolders = DriveApp.getFolderById(get_invoice_folder_id());
 
  var setting;
  var curr_date = new Date();
  var currMonth = curr_date.getMonth() + 1;
  var currDay = curr_date.getDate();
  var new_delegate_price;
  if (currMonth >= get_pricing_period_month("late") && get_pricing_period_day("late") >= 10){
    setting = "Late";
    new_delegate_price = get_price("late");
  }
  else{
    setting = "Regular";
    new_delegate_price = get_price("regular");
  }
  
  var date_string = currMonth + "/" + currDay + "/" + curr_date.getFullYear();
  
  var spreadsheet = SpreadsheetApp.openById(get_registration_spreadsheet_id());
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  
  var registration_sheet = (setting == "Late") ? spreadsheet.getSheets()[3] : spreadsheet.getSheets()[2];
  var num_rows = registration_sheet.getLastRow();
  var registration_range = registration_sheet.getRange(1, 1, num_rows, 13).getValues();
  var row_index = 2;
  
  //for (var i = 0; i < 1; i++){
  for (; row_index <= num_rows; row_index ++){
    if (registration_range[row_index - 1][12] == "yes" || registration_range[row_index - 1][12] == "Yes"){
      Logger.log("start reanalysis");
      var date_cell = registration_sheet.getRange(row_index, 1);
      var date = date_cell.getValue();
      
      var del_name_cell = registration_sheet.getRange(row_index, 2);
      var del_name = del_name_cell.getValue()
      
      var email_cell = registration_sheet.getRange(row_index, 3);
      var email = email_cell.getValue();
      
      var num_dels_cell = registration_sheet.getRange(row_index, 4);
      var num_dels = num_dels_cell.getValue();
      
      var deposit_cell = registration_sheet.getRange(row_index, 5);
      var deposit = deposit_cell.getValue();
      var deposit_qty = 0;
      if (to_price(deposit) == "$100.00"){
        deposit_qty = 1;
      }
      
      var delegate_fee_cell = registration_sheet.getRange(row_index, 6);
      delegate_fee_cell.setValue("$" + num_dels * new_delegate_price + ".00");
      var delegate_fee = delegate_fee_cell.getValue();
      
      var transportation_fee_cell = registration_sheet.getRange(row_index, 7);
      var transportation_fee = transportation_fee_cell.getValue();
      var transport_qty = 1;
      if (to_price(transportation_fee) == "$0.00"){
        transport_qty = 0;
      }
      Logger.log("transpotation = " + transportation_fee);
      
      var online_pay_cell = registration_sheet.getRange(row_index, 8);
      var online_pay = online_pay_cell.getValue();
      var online_pay_qty = 1;
      if (to_price(online_pay) == "$0.00"){
          online_pay_qty = 0;
      }
      Logger.log("online pay fee = " + online_pay);
      
      var total_cell = registration_sheet.getRange(row_index, 9);
      var new_total = to_price(deposit + delegate_fee + transportation_fee + online_pay);
      total_cell.setValue(new_total);
      
      var advisor_name_cell = registration_sheet.getRange(row_index, 10);
      var advisor_name = advisor_name_cell.getValue();
      Logger.log(advisor_name);
      var new_invoice = createPdf(del_name, email, date_string, num_dels, deposit_qty, transport_qty, online_pay_qty);
      
      var salutation = "Dear ";
      if (num_dels == 1){
        salutation += get_first_name(del_name);
      }
      else{
        salutation += get_first_name(advisor_name);
      }
      salutation += ",\n\n";
      
      var year_string = get_year().toString();
      
      var subject = "CMUNC " + year_string + " Notification - Update to Registration";
      var reminder_msg_1 = "Thank you for registering for CMUNC " + year_string + ". We have yet to receive any payments for you, and since our ";
      var pricing_period_msg;
      if (setting == "Early"){
        pricing_period_msg = "Early Registration period ended on " + get_end_date_string("early") + ", you will now be charged the Regular Registration prices ($" + get_price("regular") + " per delegate. ";
      }
      else{
        pricing_period_msg = "Regular Registration period ended on " + get_end_date_string("regular") + ", you will now be charged the Late Registration prices ($" + get_price("late") + " per delegate). ";
      }
      var reminder_msg_2 = pricing_period_msg + "Your updated invoice is attached to this email. Please let us know if you prefer to pay via check or PayPal, and feel free to contact our Director-General, " + get_first_name(get_secretariat("director")) + ", at dg@cmunc.net if you have any questions.";
      var reminder_msg_3 = " We hope to see you at CMUNC " + year_string + ".\n\n";
      var closing = "Yours sincerely,\n\n" + get_secretariat("tech") + "\nDirector of Technology\nCornell Model United Nations Conference " + year_string + "\nit@cmunc.net";
      var message = salutation + reminder_msg_1 + reminder_msg_2 + reminder_msg_3 + closing;
      
      MailApp.sendEmail(email, subject, message, {
        name : "Cornell Model United Nations Conference",
        attachments : [new_invoice],
        cc : ("dg@cmunc.net", "finance@cmunc.net")
      });
      
      Logger.log(registration_range[row_index - 1][12]);
      Logger.log(registration_range[row_index - 1][2]);
      Logger.log(registration_range[row_index - 1][1]);
    }
  }
}
        
  
