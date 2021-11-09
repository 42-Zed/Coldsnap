var ImgName, ImgURL;
var files = [];
var reader = new FileReader();

//Select an Image Locally
function selectImage() {
    'use strict';

    document.getElementById("select").addEventListener("click", function (e) {
        //console.log("The button was clicked!");

        var input = document.createElement('input');
        input.type = 'file';

        // "=>" creates an anonymous function
        input.onchange = e => {
            files = e.target.files;
            reader = new FileReader();
            reader.onload = function () {
                document.getElementById("image").src = reader.result;
            }
            reader.readAsDataURL(files[0]);
        }

        input.click();
    });
}

//Upload an Image
function uploadImage() {
    'use strict';

    document.getElementById("upload").addEventListener("click", function () {
        ImgName = document.getElementById("namebox").value;
        //Store the image into a unique folder specific to the current logged in User based on FB UID
        var uploadTask = firebase.storage().ref(firebase.auth().currentUser.uid + '/Images/' + ImgName + ".png").put(files[0]);

        //Calculate Upload Progress
        uploadTask.on('state_changed', function (snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                //Dropped the decimal places to make the upload progress cleaner
                progress = progress.toFixed(0);

                document.getElementById("upProgress").innerHTML = 'Upload Progress: ' + progress + "%";
            },

            //Error Handling
            function (error) {
                alert('Error in saving the image');
            },

            //Submitting Image Link to Firebase DB
            function () {
                /*
                Retrieve the download URL then add it to the corresponding user based on UID. Specifically,
                we add it to an array field value within the user's document. This will allow us to pull all the
                images associated with a specific user to display onto the user profile page.
                */
                uploadTask.snapshot.ref.getDownloadURL().then(function (url) {
                    ImgURL = url;
                    
                    firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
                        imgLinks: firebase.firestore.FieldValue.arrayUnion(ImgURL)
                    });
                });

                // firebase.database().ref('Pictures/' + ImgName).set({
                //     Name: ImgName,
                //     Link: ImgURL
                // });

                alert('image added successfully');
            }
        );
    });
}

//Retrieve an Image
function retrieveImage() {
    var docData;

    document.getElementById("retrieve").addEventListener("click", function () {
        //ImgName = document.getElementById("namebox").value;
        //console.log(firebase.auth().currentUser.uid + '/Images/' + ImgName);

        //Get a reference to the current User document and retrieve the ImgLinks array from that ref
        firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((docRef) => {
            docData = docRef.data();
            document.getElementById("image").src = docData.imgLinks[0];

            // console.log(docData);
            // console.log(docData.imgLinks[0]);
        });
    });
}

function initializeEvents() {
    'use strict';

    selectImage();
    uploadImage();
    retrieveImage();
    console.log("I'm Running!");
}

initializeEvents();