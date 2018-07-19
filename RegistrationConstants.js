/*
Returns a certain price depending on the argument

Accepted arguments are: "dep" or "deposit" (for the deposit), "online" (for the online pay fee), "transport" or "transportation" (for the transportation fee), "early" (for the early registration fee),
"regular" (for the regular registration fee), and "late" (for the late registration fee). Unsupported arguments will not yield a return value.

price : (String) the price you need the value of
@return : (Number) the price that matches the argument
*/
function get_price(price){
  if (price.toLocaleLowerCase().indexOf("dep") != -1){
    return 100; //CHANGE THIS to whatever the deposit cost is
  }
  else if (price.toLocaleLowerCase().indexOf("online") != -1){
    return 20; //CHANGE THIS to whatever the online pay fee is
  }
  else if (price.toLocaleLowerCase().indexOf("transport") != -1){
    return 30; //CHANGE THIS to whatever the online pay fee is
  }
  else if (price.toLocaleLowerCase().indexOf("early") != -1){
    return 85; //CHANGE THIS to whatever the Early Registration fee is
  }
  else if (price.toLocaleLowerCase().indexOf("regular") != -1){
    return 90; //CHANGE THIS to whatever the Regular Registration fee is
  }
  else if (price.toLocaleLowerCase().indexOf("late") != -1){
    return 95 //CHANGE THIS to whatever the Late Registration fee is
  }
}


/*
Returns the ID of the Invoice Template document as a String
*/
function get_template_id(){
  return '1dFJr4poh5hmYyuqFsPOknvNV8kYmasv0Vhdwfqt2FMg'; //CHANGE THIS to whatever the ID of the Invoice Template document is. 
  //The document should always be located in the same drive folder as the current CMUNC conference - do not reuse previous years' documents, copy them or move them.
}


/*
Returns the month (as a number) when the given pricing period begins.

If the period argument is set to "early", returns the month when the early pricing period begins. Likewise, does the same for "regular" and "late" arguments.

period : (String) the pricing period; "early" and "regular" are accepted as arguments for those respective pricing periods. If period matches neither of those two, returns the month for the late period.
@return : (Number) the month when the pricing period begins
*/
function get_pricing_period_month(period){
  if (period == "early"){
    return 8; //CHANGE THIS to whatever month the Early pricing period begins
  }
  else if (period == "regular"){
    return 11; //CHANGE THIS to whatever month the Regular pricing period begins
  }
  else{
    return 2; //CHANGE THIS to whatever month the Late pricing period begins
  }
}


/*
Returns the day (as a number) when the given pricing period begins.

If the period argument is set to "early", returns the day when the early pricing period begins. Likewise, does the same for "regular" and "late" arguments.

period : (String) the pricing period; "early" and "regular" are accepted as arguments for those respective pricing periods. If period matches neither of those two, returns the day for the late period.
@return : (Number) the day when the pricing period begins
*/
function get_pricing_period_day(period){
  if (period == "early"){
    return 14; //CHANGE THIS to whatever day the Early pricing period begins
  }
  else if (period == "regular"){
    return 4; //CHANGE THIS to whatever day the Regular pricing period begins
  }
  else{
    return 10; //CHANGE THIS to whatever day the Late pricing period begins
  }
}


/*
Returns the end date of the given period as a String.

To be used for emails sent to delegations transferred from Early/Regular prices to Regular/Late prices. Supported arguments are "early" or "regular".
*/
function get_end_date_string(period){
  if (period == "early"){
    return "November 3rd"; //CHANGE THIS to whenever the Early pricing period ends
  }
  else if (period == "regular"){
    return "February 9th"; //CHANGE THIS to whenever the Regular pricing period ends
  }
}
