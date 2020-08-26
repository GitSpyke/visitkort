// initializes Firebase and Firestore with my app's Firebase configuration
firebase.initializeApp({
  apiKey: "AIzaSyA6EOA5AI80dgilDfUHITEYApqjZbPTjOg",
  authDomain: "visitkort-76fe8.firebaseapp.com",
  databaseURL: "https://visitkort-76fe8.firebaseio.com",
  projectId: "visitkort-76fe8",
  storageBucket: "visitkort-76fe8.appspot.com",
  messagingSenderId: "222134215924",
  appId: "1:222134215924:web:a2fce29f69ee5432ab6aa1",
  measurementId: "G-997NY58CV0"
});

// is used mainly as a reference for the order between fields
const orderArray = ["name", "surName", "telephone", "email"];
// reference to the image storage (storageReference)
var storRef = firebase.storage().ref();
// reference to the database (collectionReference)
var collRef = firebase.firestore().collection("visitkort");
// variable to keep track of ID incrementation
var countID = 0;
// ID variable used for modification and updating of related card
var toModifyID;
// varable that will represent any current image-endoding
var imageString;

// gets the highest ID of all items in the database
collRef.orderBy("id", "desc").limit(1).get().then(function (querySnapshot) {
  querySnapshot.forEach(function (doc) {
    countID = doc.id;
  })
})

// pushes values to the database
function addValues(id) {
  collRef.doc(String(id)).set({
    id: id,
    name: form.name.value,
    surName: form.surName.value,
    telephone: form.telephone.value,
    email: form.email.value,
    image: id + "image"
  })
}

// creates and adds table representing a card onto the interface
function createCardGraphic(data) {
  var table = document.createElement('table');
  var td = table.insertRow().insertCell();
  var imgtd = table.insertRow().insertCell();
  table.className = "card";
  td.className = "cardHeader";
  td.appendChild(document.createTextNode("Visitkort"));
  storRef.child(data["image"]).getDownloadURL().then(function(url) {
    imgtd.innerHTML = "<img src=" + url + " height='40px' />";
  });
  for (element in orderArray) {
    var field = orderArray[element];
    var td = table.insertRow().insertCell();
    var field = orderArray[element];
    td.appendChild(document.createTextNode(field + ": " + data[field]+ "\n"));
    }
  $(".right").append(table);
}

// adds a button for modifying a specific card
function addButton(type, data) {
  key = {"modify": "Ändra ", "remove": "Ta bort "}
  var tempButton = document.createElement('button');
  tempButton.className = type + " button";
  tempButton.id = data.id + "_" + type + "Button";
  tempButton.innerHTML = key[type] + "ovanstående visitkort";
  $(".right").append(tempButton);
}

// removes currently listed cards and associated buttons from interface
function removeListOfCards() {
  $(".modify").remove();
  $(".card").remove();
  $(".remove").remove();
}

// lists all cards in the database
function listCards() {
  removeListOfCards();
  collRef.orderBy("id", "desc").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      createCardGraphic(doc.data());
      addButton("modify", doc.data());
      addButton("remove", doc.data());
    })
  })
}

// encodes image as Base64
function encodeImageAsURL(image) {
  var file = image.files[0];
  var reader = new FileReader();
  reader.onloadend = function() {
    imageString = reader.result;
  }
  reader.readAsDataURL(file);
};

// uploads image as Base64 string to the image storage
function uploadImage(id) {
  var imgRef = storRef.child(id + "image");
  imgRef.putString(imageString, 'data_url').then(function(snapshot) {
  listCards() //maybe just one, also shouldn't be here if supposed to be dynamic
  });
}

// adds a new document to the database with data from the form
function addCard() {
  countID++;
  addValues(countID);
  uploadImage(countID)
};

// updates currently accessed card
function updateCard() {
  $("#updateButton").prop('disabled', true);
  collRef.doc(toModifyID).update({
    name: form.name.value,
    surName: form.surName.value,
    telephone: form.telephone.value,
    email: form.email.value,
  });
  uploadImage(toModifyID)
}

// fills fields in form with data from provided document
function fillFields(data) {
  for (element in orderArray.slice(0,-1)) {
    $("#" + orderArray[element]).val(data[orderArray[element]])
  }
}

// removes document from database based on id
$(document).on("click", ".remove", function(event) {
  collRef.doc(this.id.split("_")[0]).delete();
  listCards();
});

// allows for modification of a document based on id
$(document).on("click", ".modify", function(event) {
  toModifyID = (this.id).split("_")[0];
  collRef.doc((this.id).split("_")[0]).get().then(function(doc) {
    fillFields(doc.data());
    $("#updateButton").prop('disabled', false);
    window.scrollTo({top: 0, behavior: 'smooth'});
  })
})

$("#updateButton").click(updateCard);
$("#addButton").click(addCard);
$("#getButton").click(listCards);
