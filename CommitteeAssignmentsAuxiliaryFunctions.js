/*
Sets up and runs the quicksort function.

arr : The array to be sorted

@return : The sorted array
*/
function quicksort_setup(arr){
  var high = arr.length - 1;
  var percent_filled = get_percent_filled();
  arr = quicksort_by_percent_filled(arr, 0, high, percent_filled);
  return arr
}


/*
Given an array of committee names, sorts them in order of least filled (proportionally) to most filled.
*/
function quicksort_by_percent_filled(arr, low, high, percent_filled){
  if (low < high){
    var pi = partition(arr, low, high, percent_filled);
    quicksort_by_percent_filled(arr, low, pi - 1, percent_filled);
    quicksort_by_percent_filled(arr, pi + 1, high, percent_filled);
  }
  return arr;
}


/*
Supporting function for quicksort
*/
function partition(arr, low, high, percent_filled){
    var pivot = arr[high];
    var smaller_boundary = low - 1;
    var curr_elem = low;
    for (; curr_elem <= high; curr_elem++){
      //if (arr[curr_elem] < pivot){
      if (percent_filled[arr[curr_elem]] < percent_filled[pivot]){
            smaller_boundary++;
            swap(arr, curr_elem, smaller_boundary);
      }
    }
    swap(arr, high, smaller_boundary + 1);
    return smaller_boundary + 1;
}


/*
Supporting function for quicksort
*/
function swap(arr, a, b){
  var temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}


/*
Returns the row number of the first row of unassigned responses to the preference form

@return : (Number) the row number of the first of the unassigned preference form responses
*/
function get_responses_start_row(){
  var responses_sheet = SpreadsheetApp.openById(get_form_responses_sheet_id()).getSheets()[0];
  var parse_responses_start_row = 0;
  //Logger.log("last row: " + responses_sheet.getLastRow());
  for (var i = responses_sheet.getLastRow(); i > 0; i--){
    //Logger.log("parse some preference; find last row; i = " + i);
    if (responses_sheet.getRange(i, 39).getValue() == "Yes"){
      //Logger.log("parse some preference; last row found; i = " + i);
      parse_responses_start_row = i + 1;
      break;
    }
  }
  return parse_responses_start_row;
}


/*
Returns the number of GA positions that a delegation should be assigned based on its delegation size.

Crisis/specialized and GA positions are allocated to a delegation based on the respective fullness by percentage of both of those groups. 
For example, if out of all unfilled positions, 40% are crisis/specialized and 60% are GA,
and the function acts on a delegation of 10 students, the delegation will receive 4 crisis/specialized positions and 6 GA positions. So, this function will return 6 since the function returns
the number of GA positions the delegation should have.
*/
function get_proportions(num_dels){
  var assignments_spreadsheet = SpreadsheetApp.openById(get_assignments_sheet_id());
  var ga_tabs = get_ga_tabs();
  var ga_tab_counter = 0;
  var total_positions = 0;
  var ga_unfilled = 0;
  var ga_unfilled_capped = 0;
  var other_unfilled = 0;
  var ga_under_cap = false; //Indicates if there are still one or more GA committees with less than 80 delegates
  for (var i = 1; i < assignments_spreadsheet.getSheets().length; i++){
    var committee_sheet = assignments_spreadsheet.getSheets()[i];
    var total_positions = committee_sheet.getRange(2, 5).getValue();
    var percent_filled = committee_sheet.getRange(2, 6).getValue();
    var total_unfilled = total_positions - Math.round(total_positions * (percent_filled / 100.0));
    if (i == ga_tabs[ga_tab_counter]){
      ga_tab_counter++;
      ga_unfilled += total_unfilled;
      if (Math.round(total_positions * (percent_filled / 100.0)) < 80){ //If this GA has less than 80 positions assigned
        //Logger.log("committee: " + committee_sheet.getName() + "; unfilled positions: " + (80 - (Math.round(total_positions * (percent_filled / 100.0)))))
        ga_unfilled_capped += 80 - Math.round(total_positions * (percent_filled / 100.0));
        ga_under_cap = true;
      }
    }
    else{
      //Logger.log("committee: " + committee_sheet.getName() + "; unfilled positions: " + (total_positions - Math.round(total_positions * (percent_filled / 100.00))));
      other_unfilled += total_unfilled;
    }
  }
  if (ga_under_cap){ //If all GAs have under 80 delegates,and crisis/specialized may or may not be all filled, assign to both proportionally
   // Logger.log("ga_unfilled_capped = " + ga_unfilled_capped + "; other unfilled = " + other_unfilled);
   // Logger.log(ga_unfilled_capped / (ga_unfilled_capped + other_unfilled));
    return Math.round((ga_unfilled_capped / (ga_unfilled_capped + other_unfilled)) * num_dels);
  }
  else if (!ga_under_cap && other_unfilled == 0){ //If all GAs have at least 80 delegates, assign entirely to crisis/specialized
    //Logger.log("All GAs at cap");
    return 0 * num_dels;
  }
  else{ //If all crisis/specialized are full, assign entirely to GAs
    return 1 * num_dels;
  }
}


/*
Gets the first row of committee assignments whose advisors have not been notified by email
*/
function get_first_email_send_row(){
  var overview_sheet = SpreadsheetApp.openById(get_assignments_sheet_id()).getSheets()[0];
  //var assignments_range = overview_sheet.getRange(1, 1, overview_sheet.getLastRow(), 8).getValues();
  var email_sent_cell;
  var num_emails_sent = 0;
  var first_email_send_row = overview_sheet.getLastRow();
  for (var i = overview_sheet.getLastRow(); i > 0; i--){ //Loop through spreadsheet to find the first assignment row for which the advisor has not yet been informed by email
    email_sent_cell = overview_sheet.getRange(i, 8).getValue();
    if (email_sent_cell == "Yes" || email_sent_cell == "yes"){
      first_email_send_row = i;
      return first_email_send_row;
    }
  }
}


/*
Returns a list of all crisis and specialized committees
*/
function get_other(){
  var other = [];
  var assignments_sheet = SpreadsheetApp.openById(get_assignments_sheet_id());
  for each (var tab in get_specialized_tabs()){
    var tab_name = assignments_sheet.getSheets()[tab].getName();
    other.push(tab_name);
  }
  for each (var tab in get_crisis_tabs()){
    var tab_name = assignments_sheet.getSheets()[tab].getName();
    other.push(tab_name);
  }
  return other;
}


/*
Returns a list of all GA committees, sorted by least filled (proportionally) to most filled
*/
function get_least_ga(){
  var num_ga = get_num_ga();
  var percent_filled = get_percent_filled();
  var ga_committees = get_ga();
  ga_committees = quicksort_setup(ga_committees);
  if (percent_filled[ga_committees[0]] == 100){
    MailApp.sendEmail("it@cmunc.net", "Committee Assignment Error", "All GAs filled");
  }
  return ga_committees;
}


/*
Returns the crisis/specialized committee that is proportionally the least filled
*/
function get_least_other(){
  var num_other = get_num_other();
  var percent_filled = get_percent_filled();
  var least_other = get_other()[0];
  for each (var other in get_other()){
    if (percent_filled[least_other] > percent_filled[other]){
      least_other = other;
    }
  }
  if (percent_filled[least_other] == 100){
    MailApp.sendEmail("it@cmunc.net", "Committee Assignment Error", "All Crisis/Specialized filled");
  }
  return least_other;
}

/*
Returns the committee (GA, crisis, or specialized) that is proportionally the least filled
*/
function get_least_filled(){
  var percent_filled = get_percent_filled();
  var least_ga = get_least_ga();
  var least_other = get_least_other();
  var to_log = (percent_filled[least_ga] > percent_filled[least_other]) ? least_ga : least_other;
 // Logger.log(to_log);
  return Math.min(percent_filled[least_ga], percent_filled[least_other]);
}


/*
Returns the number of committees in total. In order for this function to work properly, the Committee Assignments sheet must contain no tabs other than the overview or schools tab, and one tab per committee
*/
function get_num_committees(){
  assignments_sheet = SpreadsheetApp.openById(get_assignments_sheet_id());
  var num_committees = assignments_sheet.getSheets().length - 1
  return num_committees;
}


/*
Returns a dictionary where the keys are committee names, and the values are the percentages of how many positions in each committee are filled.
*/
function get_percent_filled(){
  var assignments_sheet = SpreadsheetApp.openById(get_assignments_sheet_id());
  var percent_filled = {};
  var sheets = assignments_sheet.getSheets()
  for (var i = 1; i < sheets.length; i++){
    percent_filled[sheets[i].getName()] = sheets[i].getRange(2, 6).getValue();
    //Logger.log(sheets[i].getName() + ' ' + sheets[i].getRange(2, 6).getValue());
  }
  return percent_filled;
}
  

/*
Returns a dictionary where the keys are committee names, and the values are the tab numbers of the associated committee
*/
function get_committee_tabs(){
  var assignments_sheet = SpreadsheetApp.openById(get_assignments_sheet_id());
  var committee_tabs = {};
  var sheets = assignments_sheet.getSheets()
  for (var i = 1; i < sheets.length; i++){
    committee_tabs[sheets[i].getName()] = i;
  }
  return committee_tabs;
}


/*
Given a group delegation's reponse array, returns the 10 preferred countries as their own array
*/
function get_country_pref(response){
  var country_pref = response.slice(25, 35);
  return country_pref;
}


/*
Given a group delegation's response array, returns the preferred specialized committees as their own array
*/
function get_specialized_pref(response){
  var specialized_pref = response.slice(7, 15);
  return specialized_pref;
}


/*
Given a group delegation's response array, returns the preferred crisis committees as their own array
*/
function get_crisis_pref(response){
  var crisis_pref = response.slice(15, 25);
  return crisis_pref;
}


/*
Given a group delegation's response array, returns an array composed of the delegation's preferred crisis and specialized committees in order.
The function will add the delegation's preferred crisis and specialized committees in order to the return array, but randomly decides whether or not to add a crisis committee or a specialized committee.
Given an array of preferred crisis committees [Crisis 1, Crisis 2, Crisis 3] and an array of preferred specialized committees [Specialized 1, Specialized 2, Specialized 3], the function may return an array composed
of [Crisis 1, Specialized 1, Crisis 2, Specialized 2, Crisis 3, Specialized 3], [Crisis 1, Crisis 2, Specialized 1, Specialized 2, Specialized 3, Crisis 3], etc.
*/
function get_other_pref(response){
  var crisis_pref = get_crisis_pref(response);
  var specialized_pref = get_specialized_pref(response);
  var crisis_index = 0;
  var specialized_index = 0;
  var other_pref = [];
  
  while (crisis_index < crisis_pref.length || specialized_index < specialized_pref.length){
    if (Math.random() * 2 == 1){
      if (crisis_index < crisis_pref.length){
        other_pref.push(crisis_pref[crisis_index]);
        crisis_index++;
      }
      if (specialized_index < specialized_pref.length){
        other_pref.push(specialized_pref[specialized_index]);
        specialized_index++;
      }
    }
    else{
      if (specialized_index < specialized_pref.length){
        other_pref.push(specialized_pref[specialized_index]);
        specialized_index++;
      }
      if (crisis_index < crisis_pref.length){
        other_pref.push(crisis_pref[crisis_index]);
        crisis_index++;
      }
    }
  }
 // Logger.log("other pref[0] = " + other_pref[0]);
  return other_pref;
}
  

/*
Given a school name and a delegate name, sends an email to it@cmunc.net indicating that all committees are full and the school could not be added.

name : (String) The name of the individual delegate, otherwise blank

school : (String) The name of the school, or "Individual Delegate"
*/
function send_full_error(name, school){
  MailApp.sendEmail("it@cmunc.net", "Committee Assignment Error - All Committees Full", name + ", " + school + " could not be added.");
}


/*Extracts and returns the first name from a string

When giving a name, returns the first name. The first name is defined as all characters before the first space character.
If the name contains no spaces, the original name is returned.

name : The name from which the first name is to be extraced.

@return : Either the first name, or the original name argument*/

function get_first_name(name){
  if (name.indexOf(" ") > -1){
    if (name.indexOf(".") > -1 && name.indexOf(".") > 3){
      var title_period = name.indexOf(".");
      var space = name.indexOf(" ", title_period + 2);
      if (space > -1){
        return name.substring(title_period + 2, space);
      }
      else {
        return name.substring(title_period + 2, name.length);
      }
    }
    else{
      var space = name.indexOf(" ");
      return name.substring(0, space);
    }
  }
  else{
    return name;
  }
}