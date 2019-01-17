/*Credit goes to Andrew Roberts (www.andrewroberts.net) for writing the original script at
https://gist.github.com/andrewroberts/21bc8b1b3fc7d3b40e6b. Edited somewhat from original.
Used with permission.

This is a function designed to create a visa letter PDF from a Google Docs template.

This function will return a PDF of the template document, with the delegation-specific items (enclosed by parenthesis)
replaced with their appropriate values. 

*/

function myFunction(e)
{
  // Replace this with ID of your template document.
  var TEMPLATE_ID = '15uUklZ19Ifrdc48TWE7i2vDdUyCKuTr4QrnnrrvgL9M'; //REPLACE THIS with the ID of the visa letter template. The template should be stored in the drive for the current CMUNC year; do not reuse the CMUNC 2018 visa letter template

  
  // Set up the docs and the spreadsheet access  
  var copyFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy();
  var copyId = copyFile.getId();
  var copyDoc = DocumentApp.openById(copyId);
  var copyBody = copyDoc.getActiveSection();
 
  var individualLowercase = e.values[1].toLowerCase();
  var individualOrNot = e.values[1] == "Individual Delegate";
  var plusSchool = (individualOrNot ? "" : "and the rest of the " + e.values[1] + " delegation ");
  var studentOrAdvisor = (e.values[6] == "Student" ? "Student" : "Advisor");
  
  var toReplace = ["%firstName%", "%plusSchool%", "%studentOrAdvisor%", "%name%", "%dob%", "%passNumber%"];
  var replaceWith = [e.values[2], plusSchool, studentOrAdvisor, e.values[2], e.values[4], e.values[5]];
  

  for (var i = 0; i < toReplace.length; i++) {
    copyBody.replaceText(toReplace[i], replaceWith[i]);
  }
                         
  // Create the PDF file, rename it if required and delete the doc copy
  var name = (individualOrNot ? "" : e.values[1] + " - ");
  name += e.values[2];
  
  copyDoc.setName(name + " Visa Letter");
  copyDoc.saveAndClose();

  var newFile = DriveApp.createFile(copyFile.getAs('application/pdf'));
  newFile.setName(name + " Visa Letter.pdf");
  //copyFile.setTrashed(true);
  
  
  var body = "Dear " + getFirstName(e.values[2]) + ",";
  var individualLowercase = e.values[1].toLowerCase();
  body += "\n\nPlease find your visa letter attached to this email. We look forward to seeing you " + plusSchool + "at CMUNC " + get_year() + " this April.";
  body += "\n\nYours sincerely,\n\n" + get_secretariat("tech") + "\nDirector of Technology\nCornell Model United Nations Conference " + get_year() + "\nit@cmunc.net";
  
  MailApp.sendEmail(e.values[6], "CMUNC " + get_year() + " Visa Letter", body, {name : "Cornell Model United Nations Conference", attachments : [newFile]});
  
  newFile.setTrashed(true);
  
}

/*
Extracts a first name from a name.
*/
function getFirstName(name){
  if (name.indexOf(" ") > -1){
    if (name.indexOf(".") > -1){
      var title_period = name.indexOf(".");
      var space = name.indexOf(" ", title_period + 2);
      return name.substring(title_period + 2, space);
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
