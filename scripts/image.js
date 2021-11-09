var ImgName, ImgURL;
var files = [];
var reader = new FileReader();
var count = 0;
var reset = 0;

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
                    document.getElementById("upProgress").innerHTML = ""; // Added to 'destroy' the upload progress text upon success.
                });

                //---DEBUGGING---
                // firebase.database().ref('Pictures/' + ImgName).set({
                //     Name: ImgName,
                //     Link: ImgURL
                // });

                alert('Image added successfully');
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

                for (var i = 0; i < imageArray.length && i < 4; i++) {
                    var imageThumb = document.createElement('img');
                    imageThumb.id = i;
                    //------------------ADD IMG PROPERTIES HERE--------------------------
                    imageThumb.src = docData.imgLinks[i];
                    imageThumb.className = "thumbnail-item";

                    count++; // Shows how many elements were created. To be used in Next/Prev for loops.

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

    // Iteration functionality to destroy previous elements and
    // increments the next elements by four total (if possible).
    document.getElementById("next").addEventListener("click", function () {
        //Get a reference to the current Authenticated user and retrieve the ImgLinks array from that ref
        firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((docRef) => {
                docData = docRef.data();

                var imageArray = docData.imgLinks;

                // Failsafe to insure that when next is pressed it doesn't delete 
                // all the elements at the end of the array length.
            removeElements();

            if (imageArray.length > 4)
            {
                for (var i = count; i < imageArray.length && i < count + 4; i++) {
                    var imageThumb = document.createElement('img');
                    imageThumb.id = i;
                    //------------------ADD IMG PROPERTIES HERE--------------------------
                    imageThumb.src = docData.imgLinks[i];
                    imageThumb.className = "thumbnail-item";

                    reset++; // Stores number of elements created - 4. Used in remove elements.

                    //Add the img to the DIV element of ID: "list"
                    document.getElementById('list').appendChild(imageThumb);
                    console.log("Image added!");
                }
                count = count + 4;
            }
            });
         }, 
    );

    // Broken af prev button functionality
    /*
    document.getElementById("prev").addEventListener("click", function () {
        //Get a reference to the current Authenticated user and retrieve the ImgLinks array from that ref
        firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((docRef) => {
                docData = docRef.data();

                var imageArray = docData.imgLinks;
                removeElements();
            
                for (var i = count; i > reset; i--) {
                    var imageThumb = document.createElement('img');
                    imageThumb.id = i;
                    //------------------ADD IMG PROPERTIES HERE--------------------------
                    imageThumb.src = docData.imgLinks[i];
                    imageThumb.className = "thumbnail-item";

                    count--;
                    reset++; // Stores number of elements created - 4. Used in remove elements.

                    //Add the img to the DIV element of ID: "list"
                    document.getElementById('list').appendChild(imageThumb);
                    console.log("Image added!");
                }
            });
         }) */
}

function removeElements() {
    for (var i = reset; i < (reset + 4); i++)
    {
        var el = document.getElementById(i);
        el.remove();
    }
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

    count = 0;
    selectImage();
    uploadImage();
    retrieveImage();
    //gallery();
    console.log("I'm Running!");
}

initializeEvents();