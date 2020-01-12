let currentUserKey = "";
let chatKey = "";
let friend_id = "";

function StartChat(friendKey, friendName, friendPhoto) {
  var friendList = { friendId: friendKey, userId: currentUserKey };
  friend_id = friendKey;

  var db = firebase.database().ref("friend_list");
  var flag = false;
  db.on("value", function(friends) {
    friends.forEach(function(data) {
      var user = data.val();
      if (
        (user.friendId === friendList.friendId &&
          user.userId === friendList.userId) ||
        (user.friendId === friendList.userId &&
          user.userId === friendList.friendId)
      ) {
        flag = true;
        chatKey = data.key;
      }
    });

    if (flag === false) {
      chatKey = firebase
        .database()
        .ref("friend_list")
        .push(friendList, function(error) {
          if (error) alert(error);
          else {
            document.getElementById("chatPanel").removeAttribute("style");
            document
              .getElementById("divStart")
              .setAttribute("style", "display:none");
          }
        })
        .getKey();
    } else {
      document.getElementById("chatPanel").removeAttribute("style");
      document.getElementById("divStart").setAttribute("style", "display:none");
      hideChatList();
    }
    //////////////////////////////////////
    //display friend name and photo
    document.getElementById("divChatName").innerHTML = friendName;
    document.getElementById("imgChat").src = friendPhoto;
    document.getElementById("messages").innerHTML = "";

    LoadChatMessages(chatKey, friendPhoto);
  });
}

function LoadChatMessages(chatKey, friendPhoto) {
  let db = firebase
    .database()
    .ref("chatMessages")
    .child(chatKey);
  db.on("value", function(chats) {
    let messageDisplay = "";
    chats.forEach(function(data) {
      let chat = data.val();
      let dateTime = chat.dateTime.split(",");
      if (chat.userId !== currentUserKey) {
        messageDisplay += `<div class="row">
                            <div class="col-2 col-sm-1 col-md-1">
                                <img src="${friendPhoto}"  class="profile-logo rounded-circle">
                            </div>
                            <div class="col-6 col-sm-7 col-md-7">
                                <p class="receive">
                                    ${chat.msg}
                                    <span class="time float-right" title = '${dateTime[0]}'>${dateTime[1]}</span>
                                </p>
                            </div>
                        </div>`;
      } else {
        messageDisplay += `<div class="row justify-content-end">
                            <div class="col-6 col-sm-7 col-md-7">
                                <p class="sent float-right">${chat.msg}
                                <span class="time float-right" title = '${
                                  dateTime[0]
                                }'>${dateTime[1]}</span>
                                </p>
                            </div>
                            <div class="col-2 col-sm-1 col-md-1">
                                <img id='imgProfile' src="${
                                  firebase.auth().currentUser.photoURL
                                }" class="profile-logo rounded-circle">
                            </div>
                        </div>`;
      }
    });
    document.getElementById("messages").innerHTML = messageDisplay;
    document.getElementById("messages").scrollTo(0, document.getElementById("messages").clientHeight);
    document.getElementById('messages').scrollBy(0,9999);
  });
}

function hideChatList() {
  document.getElementById("side-1").classList.add("d-none", "d-md-block");
  document.getElementById("side-2").classList.remove("d-none");
}

document.addEventListener("keydown", function(key) {
  if (key.which === 13) {
    SendMessage();
  }
});

function SendMessage() {
  var chatMessage = {
      userId: currentUserKey,
      msg: document.getElementById('textMessage').value,
      msgType: 'normal',
      dateTime: new Date().toLocaleString()
  };

  firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function (error) {
      if (error) alert(error);
      else {
          firebase.database().ref('fcmTokens').child(friend_id).once('value').then(function (data) {
              $.ajax({
                  url: 'https://fcm.googleapis.com/fcm/send',
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'key=AIzaSyDehhfe3MVFKS-Tr-35xuy8d3Etr1Y9Hag'
                  },
                  data: JSON.stringify({
                      'to': data.val().token_id, 
                      'data': { 'message': chatMessage.msg.substring(0, 30) + '...', 
                      'icon': firebase.auth().currentUser.photoURL }
                  }),
                  success: function (response) {
                      console.log(response);
                  },
                  error: function (xhr, status, error) {
                      console.log(xhr.error);
                  }
              });
          });
          document.getElementById('textMessage').value = '';
          document.getElementById('textMessage').focus();
          document.getElementById('messages').scrollBy(0,9999);
      }
  });
}

function LoadChatList() {
  let db = firebase.database().ref("friend_list");
  db.on("value", function(lists) {
    document.getElementById(
      "lstChat"
    ).innerHTML = `<li class="list-group-item" style="background-color: #f8f8f8;">
                                                        <input type="text" placeholder="Search or new chat" class="form-control form-rounded">
                                                    </li>`;
    lists.forEach(function(data) {
      let lst = data.val();
      let friendKey = "";
      if (lst.friendId === currentUserKey) {
        friendKey = lst.userId;
      } else if (lst.userId === currentUserKey) {
        friendKey = lst.friendId;
      }
      if (friendKey !== "") {
        firebase
          .database()
          .ref("users")
          .child(friendKey)
          .on("value", function(data) {
            let user = data.val();
            document.getElementById(
              "lstChat"
            ).innerHTML += `<li class="list-group-item list-group-item-action" onclick="StartChat('${data.key}', '${user.name}', '${user.photoURL}')">
                                                            <div class="row">
                                                                <div class="clo-md-2">
                                                                    <img src="${user.photoURL}" class="friend-logo rounded-circle">
                                                                </div>
                                                                <div class="col-md-10 col-10 d-md-block" style="cursor:pointer;">
                                                                    <div class="name">${user.name}</div>
                                                                    <div class="under-name">This is some message text...</div>
                                                                </div>
                                                            </div>
                                                        </li>`;
          });
      }
    });
  });
}

function PopulateFriendList() {
  document.getElementById("lstFriend").innerHTML = `<div class='text-center'>
                                                        <span class='spinner-border text-primary mt-5' style='width:7rem;height:7rem;'></span>
                                                    </div>`;
  let db = firebase.database().ref("users");
  let lst = "";
  db.on("value", function(users) {
    if (users.hasChildren()) {
      lst = `<li class="list-group-item" style="background-color: #f8f8f8;">
                            <input type="text" placeholder="Search or new chat" class="form-control form-rounded">
                        </li>`;
    }
    users.forEach(function(data) {
      let user = data.val();
      if (user.email !== firebase.auth().currentUser.email) {
        lst += `<li class="list-group-item list-group-item-action" data-dismiss='modal' onclick="StartChat('${data.key}', '${user.name}', '${user.photoURL}')">
                  <div class="row">
                      <div class="clo-md-2">
                          <img src="${user.photoURL}" class="rounded-circle friend-logo">
                      </div>
                      <div class="col-md-10" style="cursor:pointer;">
                          <div class="name">${user.name}</div>
                      </div>
                  </div>
                </li>`;
      }
    });
    document.getElementById("lstFriend").innerHTML = lst;
  });
}

function signIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

function signOut() {
  firebase.auth().signOut();
  location.reload();
}

function onFirebaseStateChanged() {
  firebase.auth().onAuthStateChanged(onStateChanged);
}

function onStateChanged(user) {
  if (user) {
    // alert(firebase.auth().currentUser.email + '\n' + firebase.auth().currentUser.displayName);
    var userProfile = {
      email: "",
      name: "",
      photoURL: ""
    };
    userProfile.email = firebase.auth().currentUser.email;
    userProfile.name = firebase.auth().currentUser.displayName;
    userProfile.photoURL = firebase.auth().currentUser.photoURL;

    let db = firebase.database().ref("users");
    let flag = false;
    db.on("value", function(users) {
      users.forEach(function(data) {
        let user = data.val();
        if (user.email === userProfile.email) {
          currentUserKey = data.key;
          flag = true;
        }
      });
      if (flag === false) {
        firebase
          .database()
          .ref("users")
          .push(userProfile, calback);
      } else {
        document.getElementById(
          "imgProfile"
        ).src = firebase.auth().currentUser.photoURL;
        document.getElementById(
          "imgProfile"
        ).title = firebase.auth().currentUser.displayName;
        document.getElementById("lnkSignIn").style = "display: none";
        document.getElementById("lnkSignOut").style = "";
      }

      const messaging = firebase.messaging();
       navigator.serviceWorker.register('firebase-messaging-sw.js')
                .then((registration) => {
                    messaging.useServiceWorker(registration);

                    // Request permission and get token.....
                    messaging.requestPermission().then(function () {
                        return messaging.getToken();
                    }).then(function (token) {
                        firebase.database().ref('fcmTokens').child(currentUserKey).set({ token_id: token });
                    })
                });

            document.getElementById('lnkNewChat').classList.remove('disabled');
            LoadChatList();
        });
  } else {
    document.getElementById("imgProfile").src = "/img/ddd.png";
    document.getElementById("imgProfile").title = "";

    document.getElementById("lnkSignIn").style = "";
    document.getElementById("lnkSignOut").style = "display: none";
    document.getElementById("lnkNewChat").classList.add("disabled");
  }
}

function showChatList() {
  document.getElementById("side-1").classList.remove("d-none", "d-md-block");
  document.getElementById("side-2").classList.add("d-none");
}

function calback(error) {
  if (error) {
    alert(error);
  } else {
    document.getElementById(
      "imgProfile"
    ).src = firebase.auth().currentUser.photoURL;
    document.getElementById(
      "imgProfile"
    ).title = firebase.auth().currentUser.displayName;
    document.getElementById("lnkSignIn").style = "display: none";
    document.getElementById("lnkSignOut").style = "";
  }
}

onFirebaseStateChanged();
