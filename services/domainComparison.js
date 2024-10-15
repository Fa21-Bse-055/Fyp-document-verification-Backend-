const url = require("url");

function domainComparison(webURL, email) {
  console.log("webURL", url.parse(webURL));
  const webDomain = url.parse(webURL).hostname.replace("www.", "");
  console.log("webDomain",webDomain);
  const emailDomian = email.split("@")[1];
  return webDomain === emailDomian ? true : false;
}
module.exports = domainComparison;
