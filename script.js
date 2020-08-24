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

// is used mainly to maintain the order between fields
const orderArray = ["name", "surName", "telephone", "email"];

// reference to image storage
var storageReference = firebase.storage().ref();
//reference to the database
var collectionReference = firebase.firestore().collection("visitkort");
var queryToGetHighestID = collectionReference.orderBy("id", "desc").limit(1);

// ID variable to keep track of incrementation
let idCount = 0;

// ID variable used for modification and updating of card
let toModifyID;

// gets the highest ID of all items in the database
queryToGetHighestID.get().then(function (querySnapshot) {
  querySnapshot.forEach(function (doc) {
    idCount = doc.id;
  })
})

// pushes values to the database
function addValues(id) {
  collectionReference.doc(String(id)).set({
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
  //table.id =  + data.id + "table";
  table.className = "card";
  var td = table.insertRow().insertCell();
  td.appendChild(document.createTextNode("Visitkort"));
  td.className = "cardHeader";
  var imgtd = table.insertRow().insertCell();
  storageReference.child(data["image"]).getDownloadURL().then(function(url) {
    imgtd.innerHTML = "<img src=" + url + " height='40px' />";
  // Get the download URL for 'images/stars.jpg'
  // This can be inserted into an <img> tag
  // This can also be downloaded directly
});
  for (element in orderArray) {
    var td = table.insertRow().insertCell();
    var field = orderArray[element];
    td.appendChild(document.createTextNode(orderArray[element] + ": " + data[orderArray[element]]+ "\n"));
    }
  $(".right").append(table);
}

// adds a button for modifying a specific card
function addButton(type, data) {
  var tempButton = document.createElement('button');
  tempButton.className = type + " button";
  tempButton.id = data.id + "_" + type + "Button";
  if (type == "modify") {
    tempButton.innerHTML = "Ändra ovanstående visitkort";
  } else if (type == "remove") {
    tempButton.innerHTML = "Ta bort ovanstående visitkort";
  }
  $(".right").append(tempButton);
}

// removes currently listed cards and associated buttons
function removeListOfCards() {
  $(".modify").remove();
  $(".card").remove();
  $(".remove").remove();
}

// lists all cards in the database
function listCards() {
  removeListOfCards();
  collectionReference.orderBy("id", "desc").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      createCardGraphic(doc.data());
      addButton("modify", doc.data());
      addButton("remove", doc.data());
    })
  });
}

// encodes image as Base64
function encodeImageAsURL(image) {
  var file = image.files[0];
  var reader = new FileReader();
  reader.onloadend = function() {
    imageURL = reader.result;
  }
  reader.readAsDataURL(file);
}

// adds a new document to the database with data from the form
function addCard() {
  idCount++;
  addValues(idCount)
  var imageReference = storageReference.child(idCount + "image");
  imageReference.putString(imageURL, 'data_url').then();
  listCards() //maybe just one
};

// updates currenttly accessed card
function updateCard() {
  $("#updateButton").prop('disabled', true);
  collectionReference.doc(toModifyID).update({
    name: form.name.value,
    surName: form.surName.value,
    telephone: form.telephone.value,
    email: form.email.value,
  })
  listCards();
}

// fills fields in form with data from provided document
function fillFields(data) {
  for (element in orderArray.slice(0,-1)) {
    $("#" + orderArray[element]).val(data[orderArray[element]])
  }
}

// removes document from database based on id
$(document).on("click", ".remove", function(event) {
  collectionReference.doc(this.id.split("_")[0]).delete();
  listCards();
});

// allows for modification of a document based on id
$(document).on("click", ".modify", function(event) {
  toModifyID = (this.id).split("_")[0];
  collectionReference.doc(toModifyID).get().then(function(doc) {
    fillFields(doc.data());
    $("#updateButton").prop('disabled', false);
    window.scrollTo({top: 0, behavior: 'smooth'});
  })
})

$("#updateButton").click(updateCard);
$("#addButton").click(addCard);
$("#getButton").click(listCards);
