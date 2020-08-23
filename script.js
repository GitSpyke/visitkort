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

const orderArray = ["name", "surName", "telephone", "email", "image"];

var collectionReference = firebase.firestore().collection("visitkort");
var queryToGetHighestID = collectionReference.orderBy("id", "desc").limit(1);

let idCount;

// gets the highest ID of all items in the database
queryToGetHighestID.get().then(function (querySnapshot) {
  querySnapshot.forEach(function (doc) {
    idCount = doc.id;
  })
})

// pushes values to the database
function addValues(id, imageURL) {
  console.log(id);
  collectionReference.doc(String(id)).set({

    id: id,
    name: form.name.value,
    surName: form.surName.value,
    telephone: form.telephone.value,
    email: form.email.value,
    image: imageURL
  })
}

function createCardGraphic(data) {
  var table = document.createElement('table');
  table.id =  + data.id + " table";
  table.className = "card";
  table.style.width = '350px';
  table.style.border = '1px solid black';
  var td = table.insertRow().insertCell();
  td.style.borderBottom = '1px solid black';
  td.style.textAlign = 'center';
  td.appendChild(document.createTextNode("Visitkort"));
  for (temp in orderArray) {
    var td = table.insertRow().insertCell();
    var field = orderArray[temp];
    td.appendChild(document.createTextNode(orderArray[temp] + ": " + data[orderArray[temp]]+ "\n"));
    }
  document.body.appendChild(table);
}

// adds a button for modifying a specific card
function addButton(type, data) {
  var modifyButton = document.createElement('button');
  modifyButton.className = type + " button";
  modifyButton.id = data.id + "_" + type + "Button";
  modifyButton.style.height = '27px';
  modifyButton.style.margin = '5px';
  if (type == "modify") {
    modifyButton.innerHTML = "Ändra ovanstående visitkort";
  } else if (type == "remove") {
    modifyButton.innerHTML = "Ta bort ovanstående visitkort";
  }
  document.body.appendChild(modifyButton);
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
  collectionReference.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      createCardGraphic(doc.data());
      addButton("modify", doc.data());
      addButton("remove", doc.data());
    })
  });
}

let imageURL;

// encodes image as Base64
function encodeImageAsURL(image) {
  var file = image.files[0];
  var reader = new FileReader();
  reader.onloadend = function() {
    console.log('RESULT', reader.result)
    imageURL = reader.result;
  }
  reader.readAsDataURL(file);
}

// adds a new document to the database with data from the form
function addCard() {
  if (isNaN(idCount)) {idCount = 0;}
  idCount++;
  var storageReference = firebase.storage().ref();
  var imageReference = storageReference.child(idCount + "image");
  var imageImagesReference = storageReference.child("images/count" + "image");
  imageReference.putString(imageURL, 'data_url').then(function(snapshot) {
    console.log('Uploaded the image as a base64 string!');
  })
  addValues(idCount, "gs://visitkort-76fe8.appspot.com/" + idCount + "image")
};

// is supposed to modify currenttly displayed card
function updateCard() {

}

// removes document from database based on id
$(document).on("click", ".remove", function(event) {
  collectionReference.doc(this.id.split("_")[0]).delete();
  listCards();
});

// is supposed to allow for modification of a document based on id
$(document).on("click", ".modify", function(event) {
  var id = (this.id).split("_")[0];
  var documentReference = collectionReference.doc(id);
  documentReference.get().then(function(doc) {
    console.log($("#name").value)
    $("#name").value = doc.data()["name"];
    $("#surName").value = doc.data()["surName"];
    $("#telephone").value = doc.data()["telephone"];
    $("#email").value = doc.data()["email"];
    //$("#modifyButton".disabled = false);
  })
})

$("#addButton").click(addCard);
$("#getButton").click(listCards);
