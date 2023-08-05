chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'phishing_detected') {
    displayMessage();
    sendResponse({ message: 'Message displayed' });
  }
});

function displayMessage() {
  var message = document.createElement('div');
  message.style.position = 'fixed';
  message.style.top = '0';
  message.style.left = '0';
  message.style.width = '100%';
  message.style.height = '100%';
  message.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
  message.style.color = 'white';
  message.style.fontFamily = 'Arial, sans-serif';
  message.style.fontSize = '24px';
  message.style.display = 'flex';
  message.style.justifyContent = 'center';
  message.style.alignItems = 'center';
  message.textContent = 'Warning: Phishing detected!';

  document.body.appendChild(message);
}
