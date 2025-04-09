const url = require("url");

function domainComparison(webURL, email) {
  try {
    // Make sure the URL has a protocol
    let urlToProcess = webURL;
    if (!urlToProcess.startsWith('http://') && !urlToProcess.startsWith('https://')) {
      urlToProcess = 'https://' + urlToProcess;
    }
    
    console.log("Processing URL:", urlToProcess);
    
    // Parse the URL
    const parsedUrl = new URL(urlToProcess);
    
    // Extract hostname and remove 'www.' if present
    const webDomain = parsedUrl.hostname.replace(/^www\./, '');
    
    console.log("Extracted web domain:", webDomain);
    
    // Extract email domain
    const emailDomain = email.split("@")[1];
    console.log("Email domain:", emailDomain);
    
    // Compare domains
    return webDomain === emailDomain;
  } catch (error) {
    console.error("Error comparing domains:", error.message);
    // Return false if there's any error in parsing
    return false;
  }
}

module.exports = domainComparison;
