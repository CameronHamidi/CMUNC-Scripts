function myFunction(e) {
  var outreach_name = "Abigail" //CHANGE THIS VARIABLE to represent the current Director of Outreach  
  var name = e.values[2];
  body = "Dear " + outreach_name + ",\n\nThis is an automatic notification informing you that " + name + " \
has applied for financial aid. You can view the application responses here: https://docs.google.com/spreadsheets/d/1hW1Gl0ufl\
wIQd-mYNniV3Y5fMepWqO1l-OgeuZ_mB7Y/edit#gid=1328843152\n\nYours sincerely,\n\n" + "Cameron Hamidi"; //CHANGE THIS to represent the current Director of Technology, and change the url to that of the current financial aid form responses sheet
  MailApp.sendEmail("outreach@cmunc.net", "Financial Aid Application Response", body);
}
