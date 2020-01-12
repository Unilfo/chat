// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-messaging.js');

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCINFHFgkHOk1VdWTGk_-nTgTByCpWdcV4",
    authDomain: "chat-app-52768.firebaseapp.com",
    databaseURL: "https://chat-app-52768.firebaseio.com",
    projectId: "chat-app-52768",
    messagingSenderId: "1042384175474",
    appId: "1:1042384175474:web:8839a1de5f00b572239deb",
    measurementId: "G-3YVKM682CR"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // firebase.analytics();

  const messaging = firebase.messaging();


  messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'You have new message';
    const notificationOptions = {
        body: payload.data.message,
        icon: payload.data.icon
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});