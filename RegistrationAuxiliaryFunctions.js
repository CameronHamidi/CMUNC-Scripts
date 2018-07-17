/*Either determines registraton price per delegate based on date, or returns the pricing period.

Returns the current pricing period based on the date,
as provided by the Google Forms time_stamp. Dates for pricing are as follows:
Early registration: August 14, 2017 - November 3, 2017
Regular registration: November 4, 2017 - February 9, 2018
Late registration: February 10, 2018 - March 9, 2018

setting : The desired setting for this function. "price" returns a price, "period" returns a pricing period.

@return : Returns the registration period.*/

function analyze_date(time_stamp){
  var date_result;
  var time_stamp_string = String(time_stamp);
  var slash1 = time_stamp_string.indexOf("/"); //The first slash in a MM/DD/YYYY format
  var slash2 = time_stamp_string.indexOf("/", slash1 + 1); //The second slash
  var month = time_stamp_string.substring(0, slash1); //The month in a MM format
  var day = time_stamp_string.substring(slash1 + 1, slash2); //The day in a DD format
  var year = time_stamp_string.substring(slash2 + 1, slash2+5); //The year in a YYYY format    
  
  if ((month < get_pricing_period_month("early") && year == get_year() - 1) || (month == get_pricing_period_month("early") && day < get_pricing_period_day("regular") && year == 2017)){
    date_result = "Early";
  }
  else if((month < 13 && year == get_year() - 1) || (year == get_year() && month < get_pricing_period_month("late")) || (year == get_year() && month == get_pricing_period_month("late") && day < get_pricing_period_day("late"))) {
    date_result = "Regular";
  }
  else {
    date_result = "Late";
  }
  
  return date_result
}


/*Extracts and returns the first name from a string

When giving a name, returns the first name. The first name is defined as all characters before the first space character, excluding any titles (Dr., Mrs., Mr. etc) with a period in them.
If the name contains no spaces, the original name is returned.

name : The name from which the first name is to be extraced.

@return : Either the first name, or the original name argument*/

function get_first_name(name){
  if (name.indexOf(" ") > -1){
    if (name.indexOf(".") > -1){
      var title_period = name.indexOf(".");
      var space = name.indexOf(" ", title_period + 2);
      if (space > -1){
        return name.substring(title_period + 2, space);
      }
      else {
        return name.substring(title_period + 2, name.length());
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


/*
Given a number, converts it to price format: adds "$" at the beginning and ".00" at the end.

price : (Number) the number to be converted to a price

@return : (String) The price
*/
function to_price(price){
  var price_string = price.toString();
  if (price_string.charAt(0) != "$"){
    return "$" + price_string + ".00";
  }
  return price;
}
