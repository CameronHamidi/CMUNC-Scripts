/*
Returns the name of the secretariat member associated with the name argument. Supported arguments are "tech" and "sg".

name : (String) the position associated with the name you want the function to return

@return : (String) the name of the secretariat member
*/
function get_secretariat(name){
  if (name == "tech"){
    return "Cameron Hamidi"; //REPLACE THIS with the name of the current Director of Technology
  }
  else if (name == "sg"){
    return "Taylor MacBain"; //REPLACE THIS with the name of the current Secretary_General
  }
}

/*
Similar to get_secretariat, but returns the email address of the secretariat member instead.
*/
function get_email(name){
  if (name == "tech"){
    return "it@cmunc.net";
  }
  else if (name == "sg"){
    return "sg@cmunc.net";
  }
}

/*
Returns the ID of the assignments sheet
*/
function get_assignments_sheet_id() {
  return "13KzQ22e2ZH4fYFM27HIghUOMad7-Z3qvAuVq7FCZrco"; //REPLACE THIS with the ID of the Committee Assignments sheet
}


/*
Returns the id of the form responses sheet
*/
function get_form_responses_sheet_id(){
  return "1Vl1XMzS20bZ7rgknoQexiBkeuSW4tgVuBX3KxgfVG3c"; //REPLACE THIS with the ID fo the Committee/Position Preference Form (Responses) sheet
}


/*
Returns the id of the waivers folder
*/
function get_waivers_id(){
  return "1jqu8k-PLRcJwutrJBVRGLrqN2O3g2pVb"; //REPLACE THIS with the ID for the Waivers folder in the drive. Ensure that the folder contains only the finalized versions of the waivers to be sent to the advisors
}


/*
Gathers all items in the waivers folder into an array.

@return : (DriveObject array) of all files in the waivers folder.
*/
function get_waivers(){
  var waivers = []
  var waivers_folder = DriveApp.getFolderById(get_waivers_id());
  var contents = waivers_folder.getFiles();
  while (contents.hasNext()){
    waivers.push(contents.next());
  }
  return waivers;
}
  

/*
The number of "other" committees (defined as non-GA)

@return : Number
*/
function get_num_other(){
  return 19; //REPLACE THIS with the number of Specialized/Crisis committees
}

/*
The number of GA committees
*/
function get_num_ga(){
  return 3; //REPLACE THIS with the number of General Assembly committees
}

/*
Given an individual delegate's response, returns an array containing the delegate's three committee preferences

response : (String array) An entire line from the responses spreadsheet

@return : (String array) The delegate's three preferred committees
*/
function get_individual_preferences(response){
  var first_choice_index = 35; //REPLACE THIS with the number of the column marked 
  //"What is your first committee choice? (Please mark different choices for the following questions; failure to do so will jeopardize your placement in a preferred committee.)"
  //in the Committee/Position Preference sheet, plus 1. For instance, if the column is marked AJ, the 34th column in the sheet, this number should be 34 + 1 = 35.
  //Logger.log(response.length);
  var individual_preferences = [response[first_choice_index], response[first_choice_index + 1], response[first_choice_index + 2]];
 // Logger.log("get_individual_preferences: " + response[first_choice_index] + " " +  response[first_choice_index + 1] + " " + response[first_choice_index + 2]);
  return individual_preferences;
}


/*
Returns an array with each GA committee
*/
function get_ga(){
  return ["DISEC", "SPECPOL", "LEGAL"] //REPLACE THIS with each GA committee
}


/*
Given a string prefaced by "JCC" or "TCC", returns the associated least-filled (proportionally) crisis committee. For example,
given an argument of "JCC: English Civil War", and the two associated committees "JCC: English Civil War - Cavaliers" and "JCC: English Civil War - Roundheads" are 40% and 50% filled, respectively,
the function will return "JCC: English Civil War - Cavaliers".

crisis : (String) The title of a joint or triple crisis committee, prefaced by "JCC:" or "TCC"

@return : (String) The name of the associated crisis committee that is proportionally the least-filled
*/
function get_jcc(crisis){
  var percent_filled = get_percent_filled(); //UPDATE THIS FUNCTION to represent TCCs and JCCs for future conferences
  if (crisis.indexOf("JCC: English Civil War") != -1){
    if (percent_filled["JCC: English Civil War - Cavaliers"] < percent_filled["JCC: English Civil War - Roundheads"]){
      var least_crisis = "JCC: English Civil War - Cavaliers"
      }
    else{
      var least_crisis = "JCC: English Civil War - Roundheads";
    }
  }
  else if (crisis.indexOf("TCC: Example Triple Crisis") != -1){ //Follow this format to add more crisis committees
    var least_crisis = "";
    if (percent_filled["TCC: Example Triple Crisis - Committee A"] < percent_filled["TCC: Example Triple Crisis - Committee B"]){
      least_crisis = "TCC: Example Triple Crisis - Committee A";
    }
    else{
      least_crisis = "TCC: Example Triple Crisis - Committee B";
    }
    if (percent_filled[least_crisis] > percent_filled["TCC: Example Triple Crisis - Committee C"]){
      least_crisis = "TCC: Example Triple Crisis - Committee C";
    }
  }
    
  return least_crisis;
}


/*
Retuns a list of the tab numbers of the specializde committees
*/
function get_specialized_tabs(){
  return [2, 4, 6, 10, 16, 19, 20, 22]; //REPLACE THESE with the tab numbers of the specialized committees in the Committee Assignments sheet, IN ORDER. Keep in mind that tab numbers start at 0, so if a committee's tab is the
  //second in the spreadsheet, its tab number is 1.
}


/*
Retuns a list of the tab numbers of the crisis committees
*/
function get_crisis_tabs(){
  return [1, 3, 7, 8, 9, 11, 12, 14, 15, 17, 21]; //REPLACE THESE with the tab numbers of the crisis committees in the Committee Assignments sheet, IN ORDER
}


/*
Retuns a list of the tab numbers of the GA committees
*/
function get_ga_tabs(){//REPLACE THESE with the tab numbers of the general assemblies in the Committee Assignments sheet, IN ORDER
  return [5, 13, 18];
}