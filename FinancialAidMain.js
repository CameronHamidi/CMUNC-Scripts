function myFunction(e) {
  var outreach_name = get_secretariat("outreach");
  var name = e.values[2];
  body = "Dear " + outreach_name + ",\n\nThis is an automatic notification informing you that " + name + " \
has applied for financial aid. You can view the application responses here: https://docs.google.com/spreadsheets/d/1hW1Gl0ufl\
wIQd-mYNniV3Y5fMepWqO1l-OgeuZ_mB7Y/edit#gid=1328843152\n\nYours sincerely,\n\n" + get_secretariat("tech");
  MailApp.sendEmail("outreach@cmunc.net", "Financial Aid Application Response", body);
}
