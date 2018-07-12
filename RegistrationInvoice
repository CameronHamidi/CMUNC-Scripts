/*Credit goes to Andrew Roberts (www.andrewroberts.net) for writing the original script at
https://gist.github.com/andrewroberts/21bc8b1b3fc7d3b40e6b. Edited from original.
Used with permission.*/

/*This is a function designed to create an invoice PDF from a Google Docs template.

This function will return a PDF of the template document, with the delegation-specific items (enclosed by parenthesis)
replaced with their appropriate values. 

name : Either the name of the school, or the full name of the single delegate

email : The advisor's email

date : The date the registration form was filled out, in a MM/DD/YYYY format

num_dels : The total number of delegates being registered. 1 for single delegations.

dep_qty : 1 for group delegations, 0 for single delegates

transport_qty : The number of delegates requesting transportation

online_fee_qty : 1 if the online fee is being paid, 0 if it is not

@return : The Google drive file that is the invoice PDF*/

function createPdf(name, email, date, num_dels, dep_qty, transport_qty, online_fee_qty){
  // Delete all prior versions of this delegation's invoice
  var old_invoice_iterator = DriveApp.getFilesByName(name + " Invoice");
  while (old_invoice_iterator.hasNext()){
    old_invoice_iterator.next().setTrashed(true);
  }
  
  var TEMPLATE_ID = get_template_id();
  
  // Set up the docs and the spreadsheet access
  
  var copyFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy();
  var copyId = copyFile.getId();
  var copyDoc = DocumentApp.openById(copyId);
  var copyBody = copyDoc.getActiveSection();
  
  //initialize other spreadsheet keys
  var del_price = get_price(analyze_date(date));
  var del_price_price = to_price(del_price)
  var reg_total = del_price * num_dels;
  var reg_total_price = to_price(reg_total);
  
  var deposit_constant = get_price("deposit");
  var deposit = to_price(deposit_constant);
  var deposit_total = deposit_constant * dep_qty;
  var deposit_total_price = to_price(deposit_total);
  
  var transport_constant = get_price("transport");
  var transport_cost = to_price(transport_constant);
  var transport_total = transport_constant * transport_qty;
  var transport_total_price = to_price(transport_total);
  
  var online_fee_constant = get_price("online");
  var online_fee = to_price(online_fee_constant);
  var online_fee_total = online_fee_constant * online_fee_qty
  var online_fee_total_price = to_price(online_fee_total);
  
  var grand_total = to_price(reg_total + deposit_total + transport_total + online_fee_total);
    
  var period = analyze_date(date);
  
 
  // Replace the keys with the spreadsheet values
      
  var arguments = [name, email, date, del_price_price, num_dels, reg_total_price, deposit, dep_qty, deposit_total_price, transport_cost, transport_qty, transport_total_price, online_fee, online_fee_qty, online_fee_total_price, grand_total, period];
  var replace = ["%name%", "%email%", "%date%", "%del_price_price%", "%num_dels%", "%reg_total_price%", "%deposit%", "%dep_qty%", "%deposit_total_price%", "%transport_cost%", "%transport_qty%", "%transport_total_price%", "%online_fee%", "%online_fee_qty%", "%online_fee_total_price%", "%grand_total%", "%period%"];
  
  for (var i = 0; i < arguments.length; i++){
    copyBody.replaceText(replace[i], arguments[i]);
  }
  
  // Create the PDF file, rename it if required and delete the doc copy
    
  copyDoc.setName(name + " Invoice");
  copyDoc.saveAndClose();

  var newFile = DriveApp.createFile(copyFile.getAs('application/pdf'))//.setName(name + " Invoice.pdf");
  newFile.setName(name + " Invoice.pdf");
  //copyFile.setTrashed(true);
  newFile.setTrashed(true);
  return newFile;
  
}
