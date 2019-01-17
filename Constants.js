/*
Returns a specific secretariat member's name based on the argument. Supported arguments are "tech" (for Director of Technology),
"director" (for Director-General), "secretary" (for Secretary-General), and "finance" (for Director of Finance)

name : (String) the secretariat position for which you need the associated name
@return : (String) the name of the associated secretariat member
*/
function get_secretariat(name){
  if (name.toLocaleLowerCase().indexOf("tech") != -1){
    return "Kevin Guo"; //CHANGE THIS to the current Director of Technology
  }
  else if (name.toLocaleLowerCase().indexOf("director") != -1 || name.toLocaleLowerCase().indexOf("dg") != -1){
    return "Abigail Chen"; //CHANGE THIS to the current Director-General
  }
  else if (name.toLocaleLowerCase().indexOf("secretary") != -1 || name.toLocaleLowerCase().indexOf("sg") != -1){
    return "Ann Balzer"; //CHANGE THIS to the current Secretary-General
  }
  else if (name.toLocaleLowerCase().indexOf("finance") != -1){
    return "Brendan Dodd"; //CHANGE THIS to the current Director of Finance
  }
  
  else if (name.toLocaleLowerCase().indexOf("outreach") != -1){
    return "Joanna Hua"; //CHANGE THIS to the current Director of Outreach
  }
}


/*
Returns the year of the conference as a number
*/
function get_year(){
  return 2019;
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
