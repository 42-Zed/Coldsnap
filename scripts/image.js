var ImgName, ImgURL;
var files = [];
var reader = new FileReader();

//Select an Image Locally
function selectImage() {
    'use strict';

    document.getElementById("select").addEventListener("click", function (e) {
        //---DEBUGGING---
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

                //---DEBUGGING---
                // firebase.database().ref('Pictures/' + ImgName).set({
                //     Name: ImgName,
                //     Link: ImgURL
                // });

                alert('image added successfully');
            }
        );
    });
}

//Display current uploaded images
function retrieveImage() {
    'use strict';
    var docData;

    document.getElementById("show").addEventListener("click", function () {
        //Get a reference to the current Authenticated user and retrieve the ImgLinks array from that ref
        firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((docRef) => {
                docData = docRef.data();
                //---DEBUGGING---
                //document.getElementById("image").src = docData.imgLinks[0];

                var imageArray = docData.imgLinks;

                for (var i = 0; i < imageArray.length; i++) {
                    var imageThumb = document.createElement('img');
                    //------------------ADD IMG PROPERTIES HERE--------------------------
                    imageThumb.src = docData.imgLinks[i];
                    imageThumb.className = "thumbnail-item";

                    //Add the img to the DIV element of ID: "list"
                    document.getElementById('list').appendChild(imageThumb);
                    console.log("Image added!");
                }

                //---DEBUGGING---
                // console.log(docData);
                // console.log(docData.imgLinks[0]);
            });
    }, {
        once: true
    });
    // ^^^ This limits the Click Event Listener to run only once so that we don't have to deal with duplication
    //Users will have to refresh to press "Show Images" again if they have uploaded new images after activation
}

//---------------------------------EXPERIMENTAL CODE FOR GALLERY - DOES NOT WORK!!!---------------------------------------
/*
This function is very similar to RetrieveImage() but it populates the page with all the images that
the user has uploaded to Firebase DB. This is done by dynamically creating an IMG element, setting various
properties, as well as the SRC to the corresponding image URL from Firebase.
*/
// function gallery() {
//     'use strict';
//     console.log(document.firebase.auth().currentUser.uid);
//     var docData;

//     //Get a reference to the current User document and retrieve the ImgLinks array from that ref
//     firebase.firestore().collection("users").doc(document.firebase.auth().currentUser.uid).get().then((docRef) => {
//         docData = docRef.data();

//         //Get an array of all the image URLs for this user
//         var imageArray = docData.imgLinks;

//         //Iterate through and create images for all of them on the page
//         for (var i = 0; i < imageArray.length; i++) {
//             var imageThumb = document.createElement('img');
//             imageThumb.src = imageArray[i];
//             imageThumb.className = "thumbnail-item";

//             document.getElementById('list').appendChild(imageThumb);
//             console.log("Image added to gallery");
//         }
//     });
// }

function initializeEvents() {
    'use strict';

    selectImage();
    uploadImage();
    retrieveImage();
    //gallery();
    console.log("I'm Running!");
}

initializeEvents();