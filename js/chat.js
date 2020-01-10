function StartChat(id) {
  document.getElementById("chatPanel").removeAttribute("style");
  document.getElementById("divStart").setAttribute("style", "display:none");
}
function OnKeyDown() {
  document.addEventListener("keydown", function(key) {
    if (key.which === 13) {
      SendMessage();
    }
  });
}
function SendMessage() {
  let message = `<div class="row justify-content-end">
                        <div class="col-4 col-sm-5 col-md-5">
                            <p class="sent float-right">
                                ${document.getElementById("textMessage").value}
                                <span class="time">17:31</span>
                            </p>
                        </div>
                        <div class="col-2 col-sm-1 col-md-1">
                            <img id='imgProfile' src="${
                              firebase.auth().currentUser.photoURL
                            }" alt="///" class="chat-logo">
                        </div>
                    </div>`;
  document.getElementById("messages").innerHTML += message;
  document.getElementById("textMessage").value = "";
  document.getElementById("textMessage").focus();
  document
    .getElementById("messages")
    .scrollTo(0, document.getElementById("messages").clientHeight);
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
      lst += `<li class="list-group-item list-group-item-action" onclick="StartChat(1)">
                <div class="row">
                    <div class="clo-md-2">
                        <img src="${user.photoURL}" alt="/" class="rounded-circle friend-logo">
                    </div>
                    <div class="col-md-10" style="cursor:pointer;">
                        <div class="name">${user.name}</div>
                    </div>
                </div>
            </li>`;
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
    });
  } else {
    document.getElementById("imgProfile").src = "/img/ddd.png";
    document.getElementById("imgProfile").title = "";

    document.getElementById("lnkSignIn").style = "";
    document.getElementById("lnkSignOut").style = "display: none";
  }
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
