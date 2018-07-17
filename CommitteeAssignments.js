/*
Notifies advisors of their delegation assignments

If the school's assignments have been completed but the "Email Sent" column does not say "Yes", this function will email all of a delegation's assignments to the advisor's email.
Due to issues with Google's netcode, only 10 emails can be sent at a time. Once the program has completed its run, run it again to send more emails.
All waivers in the waivers folder are attached to the email.
*/
function notify_advisors(){
  var overview_sheet = SpreadsheetApp.openById(get_assignments_sheet_id()).getSheets()[0];
  var assignments_range = overview_sheet.getRange(1, 1, overview_sheet.getLastRow(), 8).getValues();
  var num_emails_sent = 0;
  var first_email_send_row = get_first_email_send_row();
    Logger.log("first_email_send_row = " + first_email_send_row);
  var waivers = get_waivers();
  var sign_waivers_message = "each student in your delegation must fill out and sign the Delegate Waiver. Each advisor must fill out and sign the Advisor Responbility Form;\
additionally, one advisor must sign the Photographic Release Form on behalf of the entire delegation.";

  for (var i = first_email_send_row; i < overview_sheet.getLastRow(); i++){ //Loop through spreadsheet to send each email to advisors
    if (assignments_range[i][7] != "Yes"){
      var adv_email = assignments_range[i][5];
      var adv_name = get_first_name(assignments_range[i][6]);
      if (assignments_range[i][4] == "1"){
        var adv_name = get_first_name(assignments_range[i][0]);
        sign_waivers_message = "you must fill out and sign the Delegate Waiver, and your accompanying parent or advisor must fill out and sign \
both the Advisor Responsibility Form and the Photographic Release Form on your behalf."
      }
      var letter = "Hello,\n\nAt the bottom of this email are your committee assignments. There is also a lot of \
important logistical information here, so please read it over and let me know if you have \
any questions or concerns. Please note that anyone allocated an ad hoc position is required \
to submit the separate application, which is currently on our website. Failure to do this will result in the delegate being reassigned.\
\n\nBackground Guides: The background guides are up on the website. The password for all the guides is CMUNC2018del (make sure CMUNC is all caps).\
\n\nHotels and Bus Loops: Please respond to this email with the name of the hotel your delegation will be staying at, even if you don't plan to use CMUNC transportation. \
\n\nName tags: Once you assign your delegates to committees, please respond to this email with a list of the delegates' names and the committee they'll \
be in, so that we can start making name tags. We will also need to know how many advisors you will be bringing, and their names. \
\n\nLiability Forms: I am attaching three liability forms to this email. It's extremely important that you complete all\
of them. You are welcome to either scan them back to me via email, or print them and bring them to the conference, whichever is more convenient for you.\
\n\nTransportation: If you need to add CMUNC transportation to and from the hotels every day, please let me know. \
\n\nDelegation Numbers: It is too late to reduce delegation numbers, but anyone wishing to add delegates please let me know soon, so that I can get a position assignment for them. \
\n\nAs always, feel free to contact me with any questions or concerns.\n\n";
      var num_dels = assignments_range[i][4];
      var email_sent_range = overview_sheet.getRange(i + 1, 8, num_dels, 1);
      var email_sent_values = [];
      for (var j = i; j < i + num_dels; j++){
        letter += assignments_range[j][2] + " - " + assignments_range[j][3] + "\n";
        email_sent_values.push(["Yes"]);
      }
      email_sent_range.setValues(email_sent_values);
      letter += "\nTaylor MacBain\nwww.cmunc.net\nsg@cmunc.net\nSecretary-General | Cornell Model United Nations Conference 2018 \n\n";
      Logger.log(letter);
      MailApp.sendEmail(adv_email, "Committee Assignment Information", letter, {name : get_secretariat("sg"), attachments : waivers, replyTo : get_email("sg")});
      i += assignments_range[i][4] - 1;
      num_emails_sent++;
      if (num_emails_sent == 10){
        break;
      }
    }
  }
}


/*
Takes a single response from the Committee/Position Preference Form and assigns positions based on that delegation's responses. Marks the "Positions Assigned" column in the Preference Form as "Yes"
*/
function parse_single_preference_response(){
  Logger.log("parse_single_preference_response(): start function");
  var responses_sheet = SpreadsheetApp.openById(get_form_responses_sheet_id()).getSheets()[0];
  var parse_responses_start_row = get_responses_start_row();
  var name_range = responses_sheet.getRange(parse_responses_start_row, 3).getValues(); //If this row is blank, assume all subsequent rows are blank and that all responses have been processed; terminate the function
  if (name_range == ""){
    return;
  }
  Logger.log("parse some preference; parse start row = " + parse_responses_start_row);
  var response = responses_sheet.getRange(parse_responses_start_row, 1, 1, 39).getValues()[0]
  Logger.log("parse_some_preference_responses: response[0] = " + response[2]);
  var positions_assigned_range = responses_sheet.getRange(parse_responses_start_row, 39);
  //var response = response[0];
  Logger.log("parse_some_preference_response: starting assign_delegation for " + response[2]);
  assign_delegation(response); 
  positions_assigned_range.setValue("Yes");
  Logger.log("finished with all delegations");
}


/*
Similar to parse_single_preference_response(), but parses 10 delegations per function call. Since functions have a limited runtime, 10 is a safe limit to the number of responses that
can be parsed per function call. Run parse_single_preference_response() or parse_some_preference_responses() multiple times to assign positions for multiple delegations.
*/
function parse_some_preference_responses(){
  var responses_sheet = SpreadsheetApp.openById(get_form_responses_sheet_id()).getSheets()[0];
  var parse_responses_start_row = get_responses_start_row();
  for (var i = parse_responses_start_row; i <= parse_responses_start_row + 10; i++){
    var name_range = responses_sheet.getRange(i, 3).getValues(); //If this row is blank, assume all subsequent rows are blank and that all responses have been processed; terminate the loop
    if (name_range == ""){
      break;
    }
    Logger.log("parse_some_preference_responses: parse start row = " + i);
    var response = responses_sheet.getRange(i, 1, 1, 39).getValues()[0]
    var positions_assigned_range = responses_sheet.getRange(i, 39);
    //var response = response[0];
    Logger.log("parse_some_preference_response: starting assign_delegation for " + response[2]);
    assign_delegation(response); 
    positions_assigned_range.setValue("Yes");
  }
  Logger.log("finished with all delegations");
}


/*
Given a preference form response, determines whether or not the response is for a group delegation or a individual delegate, and calls the respective function to further parse the response.

response : (String array) A single line from the Committee/Position Preference Form responses
*/
function assign_delegation(response) {
 // Logger.log("assign delegation");
  if (response[3] == "Individual Delegate" || response[5] == "1"){
    assign_individual(response);
  }
  else{
    assign_group(response);
  }
}


/*
Assigns an individual delegate's positions based on the form response. Catalogues the position assignment both on the Schools tab and on the committee's respective tab.

Goes through each of the individual delegate's preferred committees in order and attempts to add the delegate to those committees. If all of those committees are full,
attemps to add the delegate to the least-filled (by percentage) committee. If that fails, sends an email to it@cmunc.net with the delegate's name and a message that all committees are full.

response : (String array) A single line from the Committee/Position Preference Form responses
*/
function assign_individual(response){
  var email = response[1];
  var name = response[2];
  var group_or_indiv = "Individual Delegate"
  var adv_name = response[4];
  var num_dels = response[5];
  
  var committee_preferences = get_individual_preferences(response);
  var successfully_added;
  //Logger.log(committee_preferences[0] + " " + committee_preferences[1] + " " + committee_preferences[2]);
  for each (var preference in committee_preferences){
    //Logger.log("preference = " + preference);
    successfully_added = add_delegate(email, name, "Individual Delegate", adv_name, num_dels, preference, "");
    if (successfully_added){
      break;
    }
  }
  if (!successfully_added){
    var successfully_random = add_random(email, name, group_or_indiv, adv_name, num_dels);
    if (!successfully_random){
      send_full_error(name, "Individual Delegate");
    }
  }
}


/*
Assigns an group delegation's positions based on the form response. Catalogues the position assignments both on the Schools tab and on the committees' respective tabs.

Goes through each of the delegation's preferred committees in order and attempts to add delegates to those committees. If all of those committees are full,
attemps to add the rest of the delegates to the least-filled (by percentage) committee. If that fails, sends an email to it@cmunc.net with the delegation's name and a message that all committees are full.

Allocates crisis/specialized and GA positions based on the respective fullness by percentage of both of those groups. For example, if out of all unfilled positions, 40% are crisis/specialized and 60% are GA,
and the function acts on a delegation of 10 students, the delegation will receive 4 crisis/specialized positions and 6 GA positions.

response : (String array) A single line from the Committee/Position Preference Form responses
*/
function assign_group(response){
  Logger.log("assign_group: start of function");
  var email = response[1];
  var school = response[2];
  var group_or_indiv = response[3];
  var adv_name = response[4];
  var num_dels = response[5];
  var name = "";
    
  var percent_filled = get_percent_filled();
  
  var num_ga = get_proportions(parseInt(num_dels));
  var num_other = num_dels - num_ga;
  
  var country_pref = get_country_pref(response);
  var country_pref_index = 0;
  
  var least_ga = get_least_ga();
  var ga_index = 0;
  
  Logger.log("assign_group: num_ga = " + num_ga + "; num_other = " + num_other);
  
  Logger.log("assign_group: starting ga loop");
  var assigned_ga = {};
  for (var i = 0; i < num_ga; i++){
    Logger.log("assign_group: assigning GA position " + (i + 1) + " out of " + num_ga + " for " + school);
    if (ga_index >= least_ga.length){ //If the loop has iterated through all GA committees but this 
      //delegation still has GA positions to be assigned, start iterating the GA committees from the beginning
      ga_index = 0;
      least_ga = get_least_ga();
      if (country_pref_index != -1){ //If the country_pref_index != -1, ie if the loop has not iterated 
        //through the delegation's entire list of preferred countries, try adding this delegation to 
        //the next in their country preferences list since clearly the previous country position is not available
        country_pref_index++;
      }
    }
    if (country_pref_index >= country_pref.length){ //If the list has iterated through each one of the delegation's preferred 
      country_pref_index = -1;
    }
    if (country_pref_index == -1){
      Logger.log("assign_group: Iterated through all country preferences, now adding " + school + " to random position in " + least_ga[ga_index]);
      add_delegate(email, school, group_or_indiv, adv_name, num_dels, least_ga[ga_index], "");
      ga_index++;
      continue;
    }
    Logger.log("assign_group: calling add_delegate now for " + school + " ; least_ga = " + least_ga[ga_index] + "; country_pref = " + country_pref[country_pref_index]);
    var successfully_added = add_delegate(email, school, group_or_indiv, adv_name, num_dels, least_ga[ga_index], country_pref[country_pref_index]);
    ga_index++;
    if (!successfully_added){
      i--;
    }
    else{
      Logger.log("assign_group: successfully added delegate to " + country_pref[country_pref_index]);
      country_pref_index++;
      if (assigned_ga[country_pref[country_pref_index]] != null){
        assigned_ga[country_pref[country_pref_index]]++;
      }
      else{
        assigned_ga[country_pref[country_pref_index]] = 1;
      }
    }
  }

  Logger.log("assign_group: starting other loop");
  var other_pref = get_other_pref(response)
  var other_pref_index = 0;
  for (var i = 0; i < num_other; i++){
    //Logger.log(school + ", " + i);
    var least_other = get_least_other();
    if (percent_filled[least_other] == 100){ //If all committees are filled, alert the user
      break;
    }
    if (other_pref_index >= other_pref.length){ //If the function has iterated through all of the delegation's preferred committees, begin assigning random committees
      //Logger.log("random");
      add_random(email, school, group_or_indiv, adv_name, num_dels);
      Logger.log("assign_group: other loop: adding " + school + " to random committee");
      continue;
    }
    else{ //Normal assignment
      //Logger.log("non-random other, " + other_pref[other_pref_index] + "; other_pref_index = " + other_pref_index + "; other_pref_length = " + other_pref.length);
      Logger.log("assign_group: other loop: attempting to assign " + school + " to " + other_pref[other_pref_index]);
      var successfully_added = add_delegate(email, school, group_or_indiv, adv_name, num_dels, other_pref[other_pref_index], "");
      if (!successfully_added){ //If the delegate was not successfully added, decrease i in order to assign that delegate to a committe next iteration of the for loop
        Logger.log("assign_group: other loop: failed to non-random add " + school + " to " + other_pref[other_pref_index]);
        i--;
      }
      other_pref_index++;
    }
  }
}


/*
Adds a delegate to the committee with the least (proportional) amount of delegates.

email : (String) the email address of the delegation/individual delegate

name : (String) The name of the delegation/individual delegate

group_or_indiv : (String) Either "Individual Delegate", or the name of the school

adv_name : (String) The advisor's name

num_dels : (Number) The number of delegates in the delegation (1 for individual delegations)

@return : (Boolean) Indicates whether or not the add was successful
*/
function add_random(email, name, group_or_indiv, adv_name, num_dels){
  var percentage_filled = get_percent_filled();
  var least_committee = get_least_other();
  var add_successful;
  //Logger.log("least other = " + least_committee);
  if (percentage_filled[least_committee] != 100){
    add_successful = add_delegate(email, name, group_or_indiv, adv_name, num_dels, least_committee, "");
  }
  return add_successful;
}
 

/*
Adds a delegate to the specified committee in the specified position. Fills out the delegate information both in the overview tab and on the committee's tab in the case of a successful add

email : (String) the email address of the delegation/individual delegate

name : (String) The name of the delegation/individual delegate

group_or_indiv : (String) Either "Individual Delegate", or the name of the school

adv_name : (String) The advisor's name

num_dels : (Number) The number of delegates in the delegation (1 for individual delegations)

preference : (String) The committee to add the delegate to

position : (String) The positio to add the delegate to. May be left blank

@return : (Boolean) Indicates whether or not the add was successful
*/
function add_delegate(email, name, group_or_indiv, adv_name, num_dels, preference, position){
  Logger.log("add_delegate: start function for " + name + "; preference = " + preference + ", position = " + position);
  var selected_committee = preference;
  if (typeof preference == "string" && (preference.indexOf("JCC") != -1 || preference.indexOf("TCC") != -1)){
    selected_committee = get_jcc(preference);
  }
  var committee_tabs = get_committee_tabs();
  var assignments_spreadsheet = SpreadsheetApp.openById(get_assignments_sheet_id());
  var committee_sheet = assignments_spreadsheet.getSheets()[committee_tabs[selected_committee]];
  if (committee_sheet.getRange(2, 6).getValue() == "100"){ //If the committee is filled, return false
    Logger.log("add_delegate: " + selected_committee + " is full, returning false");
    return false;
  }
  var last_row = committee_sheet.getLastRow();
  var assigned_position_row = 0;
  for (var i = 2; i <= last_row; i++){ //Iterate through each position to find the delegate's preferred position
    if ((committee_sheet.getRange(i, 1).getValues() == position || position == "") && committee_sheet.getRange(i, 2).getValue() == ""){ //If the position matches the preferred position (or if no preferred position was given) and isn't filled
      assigned_position_row = i;
        
      var position_cell_value = committee_sheet.getRange(assigned_position_row, 1).getValues();
      var school_cell = committee_sheet.getRange(assigned_position_row, 2);
      if (group_or_indiv == "Indivual Delegate"){
        school_cell.setValue("Individual Delegate");
        var name_cell = committee_sheet.getRange(assigned_position_row, 2);
        name_cell.setValue(name);
      }
      else{
        school_cell.setValue(name);
      }
      
      var overview_sheet = assignments_spreadsheet.getSheets()[0];
      var overview_last_row = overview_sheet.getLastRow() + 1;
      
      var overview_cells = overview_sheet.getRange(overview_last_row, 1, 1, 8);
      
      var overview_school_cell = overview_sheet.getRange(overview_last_row, 1);
      if (group_or_indiv == "Individual Delegate"){
        overview_school_cell.setValue("Individual Delegate");
        var overview_name_cell = overview_sheet.getRange(overview_last_row, 2);
        overview_name_cell.setValue(name);
      }
      else{
        overview_school_cell.setValue(name);
      }
      
      var overview_committee_cell = overview_sheet.getRange(overview_last_row, 3);
      overview_committee_cell.setValue(selected_committee);
      
      var overview_position_cell = overview_sheet.getRange(overview_last_row, 4);
      overview_position_cell.setValue(position_cell_value);
      
      var overview_del_size_cell = overview_sheet.getRange(overview_last_row, 5);
      overview_del_size_cell.setValue(num_dels);
      
      var overview_email_cell = overview_sheet.getRange(overview_last_row, 6);
      overview_email_cell.setValue(email);
      
      var overview_advisor_name_cell = overview_sheet.getRange(overview_last_row, 7);
      overview_advisor_name_cell.setValue(adv_name);
      
      var email_sent_cell = overview_sheet.getRange(overview_last_row, 8);
      email_sent_cell.setValue("No");
      
      Logger.log("add_delegate: " + name + " delegate successfully added to " + position_cell_value + " in " + preference + "; returning true");
      return true;
    }
    else if (committee_sheet.getRange(i, 1).getValues() == position && position != "" && committee_sheet.getRange(i, 2).getValue() != ""){
      Logger.log("add_delegate: " + position + " in " + preference + " is taken; returning false");
      return false;
    }
  }
  if (assigned_position_row == 0){
    Logger.log("add_delegate: failed to add " + name + " to " + position + " in " + preference + ", position does not exist; returning false");
    return false;
  }
}