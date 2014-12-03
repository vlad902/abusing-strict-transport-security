var tor_browser_version_to_tails_version = {
  "31.3": "1.2.1",
  "31.1/31.1.1/31.2": "1.2",
  "24.8/24.8.1": "1.1.1/1.1.2",
  "24.7": "1.1",
  "24.6": "1.0.1",
  "24.5": "1.0",
  "24.4": "0.23",
  "24.3": "0.22.1"
}

var table_24 = [
  // [ Firefox ESR release, website in HSTS list diff, path to a valid image ]
  [ "24.8/24.8.1", "palava.tv", "/favicon.ico" ],
  [ "24.7", "wepay.com", "/favicon.ico" ],
  [ "24.6", "usaa.com", "/favicon.ico" ],
  [ "24.5", "fiken.no", "/favicon.ico" ],
  [ "24.4", "aclu.org", "/sites/default/files/mytube/yt_FrxDrpi1XNU.jpg" ],  // Hi soggy!
  [ "24.3", "torproject.org", "/favicon.ico" ]
]
// git log -p origin/esr31 browser/config/version.txt security/manager/boot/src/nsSTSPreloadList.inc
var table_31 = [
  // [ Firefox ESR release, website in HSTS list diff, path to a valid image ]
  [ "31.3", "in.xero.com", "/favicon.ico" ],
  [ "31.1/31.1.1/31.2", "wepay.com", "/favicon.ico" ]
]
var table_iterator = 0;
function determine_tor_browser_version(callback) {
  img = document.createElement("img");

  if (tor_browser_major_version() == 24) {
    var table = table_24;
  } else if (tor_browser_major_version() == 31) {
    var table = table_31;
  } else {
    callback(null);
    return;
  }

  if (table_iterator >= table.length) {
    callback(null);
  }

  test_domain_in_sts_cache(table[table_iterator][1], table[table_iterator][2], function(result) {
    console.log("Testing version " + table[table_iterator][0] + ": " + result);

    if (result) {
      callback(table[table_iterator][0]);
    } else {
      table_iterator++;
      determine_tor_browser_version(callback);
    }
  });
}

// https://$domain/$path must be a valid image URL and the domain must use HSTS.
function test_domain_in_sts_cache(domain, path, callback) {
  img = document.createElement("img");
  img.onerror = function() { callback(false); }
  img.onload = function() { callback(true); }
  img.setAttribute("src", "http://" + domain + ":443" + path);
}

function tor_browser_major_version() {
  var ua = navigator.userAgent;
  return parseInt(ua.substring(ua.lastIndexOf("/") + 1));
}

function is_tails(callback) {
  test_domain_in_sts_cache("tails.boum.org", "/favicon.ico", callback);
}

function is_tor_browser() {
  return (navigator.userAgent.indexOf("Windows NT 6.1") != -1 && 
          navigator.userAgent.indexOf("Gecko/20100101") != -1 &&
          (tor_browser_major_version() >= 10 && (tor_browser_major_version() - 10) % 7 == 0)) // 10,17,24,31,...
}

function run_fingerprints() {
  if (!is_tor_browser()) {
    $("#tbb-status").html("Not running Tor Browser");
    $("#tbb-version").html("N/A");
    $("#tails-status").html("Not running TAILS");
    $("#tails-version").html("N/A");

    return;
  } else {
    $("#tbb-status").html("Looks like Tor Browser (or Firefox ESR on Windows 7)");
  }

  determine_tor_browser_version(function(version) {
    if (version == null) {
      $("#tbb-version").html("Failed to determine ESR version");
    } else {
      $("#tbb-version").html(version);
    }

    is_tails(function(result) {
      if (result) {
        $("#tails-status").html("Looks like TAILS");
        var tails_version = tor_browser_version_to_tails_version[version];
        if (tails_version == null) {
          $("#tails-version").html("Failed to determine TAILS version");
        } else {
          $("#tails-version").html(tails_version);
        }
      } else {
        $("#tails-status").html("Does not looks like TAILS");
        $("#tails-version").html("N/A");
      }
    })
  })
}
