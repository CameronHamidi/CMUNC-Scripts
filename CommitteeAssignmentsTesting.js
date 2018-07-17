/*
Attempts to add a delegate with the given information to a committee. Make sure to replace the "preference" variable with a valid committee depending on the yearof testing
*/
function test_add_delegate(){
  var email = "it@cmunc.net";
  var name= "Cameron Hamidi";
  var school = "Individual Delegate";
  var group = "Individual Delegate";
  var adv_name = "Cameron Hamidi";
  var num_dels = 1;
  var preference = "Fall of Enron";
  add_delegate(email, name, school, group, adv_name, num_dels, preference);
}


function test_get_other_pref(){
  var responses = SpreadsheetApp.openById(get_form_responses_sheet_id());
  var response = responses.getSheets()[0].getRange(27, 1, 1, 35).getValues();
  var other_pref = get_other_pref(response[0])
  Logger.log("loop started");
  Logger.log(other_pref.length);
  Logger.log(other_pref[0]);
  for each (var committee in other_pref){
    Logger.log(committee);
  }
}

function test_quicksort(){
  var arr = ["Fall of Enron", "DISEC", "SPECPOL"];
  arr = quicksort_setup(arr);
  Logger.log(arr);
}
