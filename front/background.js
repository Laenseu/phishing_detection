chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.active && tab.url.startsWith('http')) {
    sendPhishingDetectionRequest(tab.url);
  }
});

function sendPhishingDetectionRequest(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:5000/predict', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      var prediction = response.prediction;
      if (prediction === "phishing") {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { message: 'phishing_detected' });
        });
      } else if (prediction === "legitimate") {
        alert('No phishing detected');
      } else {
        alert('Error: Unable to determine if the URL is phishing or legitimate');
      }
    }
  };
  xhr.send(JSON.stringify({ url: url }));
}
