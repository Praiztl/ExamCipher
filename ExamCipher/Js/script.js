function displayMsg(info) {
    var displayMsg = document.querySelector('#msg_section');

    displayMsg.style.borderColor = info.infoColor; // doesnt work fix it
    displayMsg.style.display = "block";
    displayMsg.innerHTML = info.infoMessage;

}

function removeMsg() {
    var displayMsg = document.querySelector('#msg_section');

    displayMsg.style.borderColor = ""; // doesnt work fix it
    displayMsg.style.display = "none";
    displayMsg.innerHTML = "";

}

function checkPasswordStrength() {

    var password = document.querySelector("#registerForm").elements['Password'].value;

    // regex for differnt password levels of strength
    // medium strength - at least 8 characters but does not contain a special character
    var mediumPasswordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

    // strong strength - at least 8 characters and contains at least a number, uppercase letter, lowercase letter and a special symbol
    var strongPasswordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;

    var info = { 'infoCode': null, 'infoMessage': null, 'infoColor': null };

    // this checks doesn't break the code it simply suggests that you use a stronger password

    if (strongPasswordRegex.test(password)) {

        info.infoColor = "green";
        info.infoCode = "102";
        info.infoMessage = "Password strength - Strong";

    } else if (mediumPasswordRegex.test(password)) {

        info.infoColor = "blue";
        info.infoCode = "101";
        info.infoMessage = "Password strength - Medium";

    } else {

        info.infoColor = "red";
        info.infoCode = "103";
        info.infoMessage = "Password strength - Weak";

    }

    // displays error message
    displayMsg(info);

    // removes error message
    setTimeout(() => {
        removeMsg();
    }, 3500);

}

function validate(data) {

    var error = { 'errorCode': null, 'errorMessage': null };

    // regex for email validation (including restriction to Babcock domain)
    var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@student\.babcock\.edu\.ng$/;

    if (data.email.trim().length === 0) {
        error.errorCode = "002";
        error.errorMessage = "email field is required";
        return error;
    }

    if (!emailRegex.test(data.email)) {
        error.errorCode = "003";
        error.errorMessage = "email is invalid or not from Babcock domain";
        return error;
    }

    if (data.password.length < 8) {

        error.errorCode = "001";
        error.errorMessage = "Password is too short";

        return error;

    }

    if (data.confirmPassword && data.password != data.confirmPassword) {

        error.errorCode = "004";
        error.errorMessage = "Password mismatch error";

        return error;

    }

    return;

}


function openUrl(destination) {

    var endUrlRegex = /.*\//;
    const windowUrl = window.location.href.match(endUrlRegex, '')[0];

    // redirects to desired page
    window.open(`${windowUrl}${destination}`, '_self');

}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

    apiKey: "AIzaSyADkKDK5Y-QJJL4ObwWdMh8DXWdRO4vB-Q",
    authDomain: "examcipher.firebaseapp.com",
    projectId: "examcipher",
    storageBucket: "examcipher.appspot.com",
    messagingSenderId: "661989638110",
    appId: "1:661989638110:web:d94d046db778409753e74f",
    measurementId: "G-WR3CMG8ENJ"

};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// enable form once page is ready
var formFieldset = document.querySelector("#formFieldset");

if (formFieldset) formFieldset.removeAttribute("disabled");

// store sign up form object
var signUpForm = document.querySelector("#registerForm");

// checks what page is currently open
if (signUpForm != undefined && signUpForm != null) {

    // get values of inputs from form
    var firstName = signUpForm.elements['FirstName'];
    var lastName = signUpForm.elements['LastName'];
    var email = signUpForm.elements['EmailID'];
    var tel = signUpForm.elements['MobileNumber'];
    var gender = signUpForm.elements['Gender'];
    var password = signUpForm.elements['Password'];
    var confirmPassword = signUpForm.elements['ConfirmPassword'];
    var submitBtn = document.querySelector("#submitBtn")

    // to store timeout event
    var timeout;


    password.onkeyup = () => {

        // this gets reset everytime so it will only fire after 3 seconds of inactivity
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(checkPasswordStrength, 3500);

    }

    // this compares the both password to see if they are a match
    confirmPassword.onkeyup = () => {

        if (confirmPassword.value != password.value) {

            // send back to front-end and prevent from from submitting
            var error = { 'infoCode': 104, 'infoColor': 'red', 'infoMessage': 'Password Mismatch' };
            displayMsg(error);

            setTimeout(() => {
                removeMsg();
            }, 3500);

        }

    }

    signUpForm.onsubmit = (e) => {
        e.preventDefault(); // Prevent default form submission

        // Disable submit button and indicate processing
        submitBtn.textContent = "Processing...";
        submitBtn.disabled = true;

        // Extract data from form fields
        var dateOfBirth = signUpForm.elements['BirthDay'].value.toString();
        var data = { 'email': email.value, 'password': password.value, 'confirmPassword': confirmPassword.value };

        // Check if the email already exists in local storage
        var existingEmail = localStorage.getItem('registeredEmail');
        if (existingEmail && existingEmail === data.email) {
            console.log("User already exists");
            Swal.fire({
                title: 'Error!',
                text: 'User with this email already exists.',
                icon: 'error',
                confirmButtonText: 'Close',
            });

            submitBtn.textContent = "Failed";
            setTimeout(() => {
                submitBtn.textContent = "Submit";
                submitBtn.disabled = false;
            }, 2500);
            return;
        }

        // Store the email in local storage
        localStorage.setItem('registeredEmail', data.email);


        // Validate data (can be improved as discussed below)
        var err = validate(data);
        if (err) {
            Swal.fire({
                title: 'Error!',
                text: err.errorCode + ': ' + err.errorMessage,
                icon: 'error',
                confirmButtonText: 'Close',
            });

            submitBtn.textContent = "Failed";
            setTimeout(() => {
                submitBtn.textContent = "Submit";
                submitBtn.disabled = false;
            }, 2500);
            return;
        }

        // Create user using Firebase's auth.createUserWithEmailAndPassword()
        auth.createUserWithEmailAndPassword(data.email, data.password)
            .then(userCredentials => {
                console.log("User credentials:", userCredentials);

                const userObject = userCredentials.user;
                const userId = userObject.uid;

                // Store user data in the database (consider security and validation improvements)
                db.ref('users/' + userId).set({
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    telephone: tel.value,
                    gender: gender.value,
                    dob: dateOfBirth,
                });

                // Update user profile information
                userObject.updateProfile({
                        displayName: `${firstName.value} ${lastName.value}`,
                    }).then(() => {
                        console.log("User profile updated successfully");

                        // Update the navbar with user information

                        // Successful signup
                        Swal.fire({
                            title: 'Success!',
                            text: 'User Created Successfully!',
                            icon: 'success',
                            confirmButtonText: 'OK',
                        }).then(() => {

                            // Reset form, set button to Submit, and redirect (as described below)
                            signUpForm.reset();
                            submitBtn.textContent = "Submit";
                            submitBtn.disabled = false;
                            openUrl('../pages/popup.html'); // Redirect to homepage
                        });
                    })
                    .catch(err => {
                        console.error("Error during signup:", err);

                        // Unsuccessful signup
                        if (err.code === "auth/email-already-in-use") {
                            console.log("User already exists");
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: err.code + ': ' + err.message,
                                icon: 'error',
                                confirmButtonText: 'Close',
                            });
                        }

                        submitBtn.textContent = "Failed";
                        setTimeout(() => {
                            submitBtn.textContent = "Submit";
                            submitBtn.disabled = false;
                        }, 2500);
                    });
            });
    }

}

// store login form object
var logInForm = document.querySelector("#logInForm");



// checks what page is currently open
if (logInForm != undefined && logInForm != null) {

    // get values of inputs from form
    var email = logInForm.elements["emailInput"];
    var password = logInForm.elements["passwordInput"];
    var loginBtn = document.querySelector("#loginBtn")

    logInForm.onsubmit = (e) => {
        e.preventDefault();

        loginBtn.textContent = "Processing...";
        loginBtn.disabled = true;

        var data = { 'email': email.value, 'password': password.value }

        err = validate(data)

        if (err) {
            alert(err.errorCode + ": " + err.errorMessage);

            loginBtn.textContent = "Failed";

            setTimeout(() => {
                loginBtn.textContent = "Login";
            }, 2500)

            loginBtn.disabled = false;

            return;
        }

        auth.signInWithEmailAndPassword(data.email, data.password)
            .then(userCrendentials => {

                var userObject = userCrendentials.user;

                console.log("User Logged In Successfully");

                loginBtn.textContent = "Success";
                loginBtn.disabled = false;

                // some basic info you might need for additional info log the userObject to the console
                // var userId = userObject.uid;
                // var displayPhoto = userObject.photoURL;
                // var displayName = user.displayName;
                // var email = userObject.email;

                // redirect to maybe another page, the _self means open in current tab
                openUrl('../pages/loginPopup.html');

            })
            .catch(err => {
                var errorCode = err.code;
                var errorMessage = err.message;

                // debugging purposes
                alert(errorCode + ": " + errorMessage);

                loginBtn.textContent = "Failed";

                setTimeout(() => {
                    loginBtn.textContent = "Login";
                }, 2500)

                loginBtn.disabled = false;
            })

    }

}




// call exam function
var examBody = document.querySelector("#examPage");
if (examBody != null && examBody != undefined) {
    getExams();
}

function checkCurrentUser() {

    // for any page that needs the user's info
    auth.onAuthStateChanged(user => {

        if (user) {

            // info will be available in user object
            return user;

        } else {

            openUrl('login.html');

        }

    });

}
const subjectMapping = {
    math: "Mathematics",
    eng: "English",
    phy: "Physics",
    chem: "Chemistry",
    bio: "Biology",
    geo: "Geography",
    econs: "Economics",
    hist: "History"
};


function startSession(courseName) {
    const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));
    if (!registeredUser) {
        console.log("No user data found. Please register.");
        alert("You need to be registered and logged in to start a session.");
        window.location.href = '../pages/selection.html'; // Adjusted path to selection page
        return;
    }

    // Corrected from courseCode to courseName
    const subjectCode = courseName.match(/[a-zA-Z]+/)[0].toLowerCase();

    // Assuming subjectMapping is defined elsewhere in your script
    const fullSubjectName = subjectMapping[subjectCode];

    if (!fullSubjectName) {
        console.log("Invalid subject code.");
        alert("Invalid subject code.");
        return;
    }

    const courseLevel = parseInt(courseName.match(/\d+/)[0].charAt(0)); // Extracts the first digit of the course number as an integer
    const courseShortName = courseName.split(' ')[0]; // Extracts the course prefix (e.g., "Math" from "Math 101")

    if (registeredUser.role === 'student') {
        if (registeredUser.studyLevel === courseLevel + '00' && registeredUser.courses.some(course => course.includes(courseShortName))) {
            console.log("Key satisfies policy, exam decrypted, please proceed.");
            window.location.href = `../pages/exam.html?subject=${fullSubjectName.toLowerCase()}`; // Use fullSubjectName here
        } else {
            console.log("You are not authorized to access this exam");
            alert("You are not authorized to access this exam");
            window.location.href = '../pages/selection.html'; // Adjusted path to selection page
        }
    } else if (registeredUser.role === 'teacher') {
        if (registeredUser.teachLevels.includes(courseLevel + '00') && registeredUser.courses.some(course => course.includes(courseShortName))) {
            console.log("Key satisfies policy, exam decrypted, please proceed.");
            window.location.href = `../pages/exam.html?subject=${fullSubjectName.toLowerCase()}`; // Use fullSubjectName here
        } else {
            console.log("You are not authorized to access this exam");
            alert("You are not authorized to access this exam");
            window.location.href = '../pages/selection.html'; // Adjusted path to selection page
        }
    }
}


function parseUrl(params) {

    var baseURL = window.location.href.toString();
    var urlObject = new URL(baseURL);

    // matches and returns the queried parameter
    return urlObject.searchParams.get(params);

}

// Exam's page logic
var selectedAnswers = {};
var correctAnswers = {};
var hasUsedHints = {};

function nextQuestion(cid) {

    if (cid == 39) {
        // last question do nothing
    } else {

        selectedOption = document.querySelector('#formfor' + cid).elements['ans'].value;
        selectedAnswers[cid] = selectedOption;

        hintValue = document.querySelector("#formfor" + cid).elements['hint'].value;
        hasUsedHints[cid] = hintValue;

        var nextQuestion = cid + 1;

        //hide current question
        document.querySelector('#q' + cid).classList.add('hide');

        if (selectedAnswers[cid] != '') {
            // add green background
            document.querySelector('#qNoBtn' + cid).classList.add('answered');
        }

        // make next question visible
        document.querySelector('#q' + nextQuestion).classList.remove('hide');

    }

}

function prevQuestion(cid) {

    if (cid == 0) {
        // last question do nothing
    } else {

        selectedOption = document.querySelector('#formfor' + cid).elements['ans'].value;
        selectedAnswers[cid] = selectedOption;

        hintValue = document.querySelector("#formfor" + cid).elements['hint'].value;
        hasUsedHints[cid] = hintValue;

        var prevQuestion = cid - 1;

        //hide current question
        document.querySelector('#q' + cid).classList.add('hide');

        if (selectedAnswers[cid] != '') {
            // add green background
            document.querySelector('#qNoBtn' + cid).classList.add('answered');
        }

        // make next question visible
        document.querySelector('#q' + prevQuestion).classList.remove('hide');

    }

}

function jumpTo(qid) {

    // hide all questions
    for (let index = 0; index < 40; index++) {
        const element = document.querySelector('#q' + index);

        if (element.classList.contains('hide') == false) {

            // record option
            selectedOption = document.querySelector('#formfor' + index).elements['ans'].value;
            selectedAnswers[index] = selectedOption;

            hintValue = document.querySelector("#formfor" + index).elements['hint'].value;
            hasUsedHints[index] = hintValue;

            element.classList.add('hide');

            if (selectedAnswers[index] != '') {
                // add green background
                document.querySelector('#qNoBtn' + index).classList.add('answered');
            }

            break;
        }
    }

    // make new element visible
    document.querySelector('#q' + qid).classList.remove('hide');

}

/*function showHint(index, instance) {
    var hintInput = document.querySelector("#hintInput" + index);
    var hintDiv = document.querySelector("#hintDiv" + index);
    var questionDiv = document.querySelector("#question" + index);
    var questionText = questionDiv.textContent.replace(questionDiv.children[0].textContent, '')

    let data = {
        prompt: questionText,
        max_tokens: 100,
        temperature: 1
    }

    // has already used hint
    if (hintDiv.classList.contains("hide") == false) {
        return;
    }

    instance.textContent = "Getting hint...";
    instance.style.opacity = .7;
    hintInput.value = true;

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "https://api.openai.com/v1/engines/davinci/completions")
    xhr.setRequestHeader("content-type", "application/json")
    xhr.setRequestHeader("Authorization", "Bearer <OPENAI TOKEN GOES HERE>")

    xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var hint = JSON.parse(this.responseText).choices[0].text;

                var hfirst = document.createElement("h4");
                hfirst.textContent = "Disclaimer: the provided answers may or may not be a useful hint as this services is a third-party service."
                hfirst.style.fontWeight = 400;
                hintDiv.appendChild(hfirst);

                var hsecond = document.createElement("h4");
                hsecond.textContent = hint;
                hsecond.style.fontWeight = 400;
                hintDiv.appendChild(hsecond);

                hintDiv.classList.remove('hide');
            }

            instance.textContent = "Show Hint";
            instance.style.opacity = 1;

        }
    }
    xhr.send(JSON.stringify(data))


}*/


function preSubmit() {
    Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, submit it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // If the user clicks "Yes," then submit the exam
            submitExam();
            window.location.href = 'exam.html';

        } else {
            // If the user clicks "No" or closes the alert, do nothing
        }
    });
}


function submitExam() {

    // appends the current question's answer before submission
    var questions = document.getElementsByClassName('examContainer');

    for (let index = 0; index < questions.length; index++) {
        const element = questions[index];
        if (element.classList.contains('hide') == false) {

            // record option
            selectedOption = document.querySelector('#formfor' + index).elements['ans'].value;
            selectedAnswers[index] = selectedOption;

            hintValue = document.querySelector("#formfor" + index).elements['hint'].value;
            hasUsedHints[index] = hintValue;

            if (selectedAnswers[index] != '') {
                // add green background
                document.querySelector('#qNoBtn' + index).classList.add('answered');
            }

            break;
        }
    }

    const Time = 40 * 60;
    const Score = 40;

    var score = 0;
    var len = Object.keys(selectedAnswers).length;

    for (let index = 0; index < len; index++) {
        const opt = selectedAnswers[index];

        if (opt == correctAnswers[index]) {
            score += 1;
        }
    }

    var hintUsed = 0;
    for (let index = 0; index < Object.keys(hasUsedHints).length; index++) {
        const usedHint = hasUsedHints[index];

        if (usedHint) {
            hintUsed += 1;
        }

    }

    var ratioOfHintsUsed = (hintUsed / 40);

    var time = document.querySelector('#time').textContent;
    time = time.split(':');

    var minInSecs = parseInt(time[0]) * 60;
    var secs = parseInt(time[1]);

    // calculate the time usage
    var remainingTime = minInSecs + secs;
    var elapsedTime = Time - remainingTime;

    // you can use these values to say things like work on your speed or work on your accuracy
    var timeEfficiency = (remainingTime / Time) * 5; // on a scale of 5
    var accuracy = (score / Score) * 5; // on a scale of 5
    var hintEfficiency = ratioOfHintsUsed * 5; // on a scale of 5


    // based on 40 questions
    // based on a 40 minutes exam
    if (score < 10 && elapsedTime < (10 * 60)) {
        timeEfficiency = 1; // just assigning it by default
    }

    var finalResult = ((timeEfficiency + accuracy + hintEfficiency) / 15) * 100;

    console.log(timeEfficiency, accuracy, hintEfficiency);

    // store scores on database
    var subject = parseUrl('subject');

    // add AI suggestions
    var suggestions;

    if (finalResult >= 85) {
        suggestions = `Good Job, ${subject} is your thing!🔥🔥`;
    } else {

        // the person probably rushed
        if (timeEfficiency > accuracy && timeEfficiency > 35) {
            suggestions = 'Don\'t be in haste take your time.😉';
        } else if (accuracy > timeEfficiency && accuracy > 35) {
            // the person used too much time
            suggestions = `That was nice but you need to work on your speed`;
        } else if (accuracy > 60 && hintEfficiency < 50) {
            suggestions = `Good Job, but try to answer the questions yourself and limit the usage of the hint button.`
        } else {
            suggestions = `Try studying more and take another test, Good Luck.`;
        }

    }

    if (subject != null) {

        auth.onAuthStateChanged(user => {

            if (user) {

                var userId = user.uid;

                const recordsDB = db.ref('records/' + userId + '/');

                recordsDB.get()
                    .then(snapshot => {

                        // this sets the new recordId but if there is something it gets overwritten
                        var recordId = 0;

                        if (snapshot.exists()) {

                            // update the recordId to be 1 + the last one
                            // the length of the array starts from 1 but the index starts from zero that's why i didnt add 1 to it
                            recordId = snapshot.val().length;

                        }

                        var timeTaken = new Date();

                        db.ref('records/' + userId + '/' + recordId).set({
                                examName: subject.toString(),
                                score: score.toString(),
                                timeUsed: elapsedTime.toString(),
                                rating: finalResult.toString(),
                                AI_suggestions: suggestions,
                                date: timeTaken.toString(),
                            }, err => {
                                if (err) {

                                    console.log(err);

                                }
                            })
                            .then(() => {

                                // result modal goes here
                                // var modal = document.getElementById("myModal");

                                // // removes additional text from date
                                // var date = date.replace(/\sGMT.*/, '');

                                // var percentageScore = (score / 40) * 100;
                                // percentageScore = percentageScore.toFixed(2);

                                // var percentageRating = (rating / 10) * 100;
                                // percentageRating = percentageRating.toFixed(2);

                                // modal.innerHTML += `

                                //     <div class="historyCard" style="background: white;">
                                //         <p class="historySubject"><b>${examName}</b></p>
                                //         <p class="historyDate"><small>${date}</small></p>
                                //         <br>
                                //         <div class="historyallScore">
                                //             <span class="hiScore">
                                //                 <h4>Normal Score</h4>
                                //                 <h2 class="historyNo">${score}/40</h2>
                                //             </span>
                                //             <span class="hiScore">
                                //                 <h4>Percentage Score</h4>
                                //                 <h2 class="historyNo">${percentageScore}%</h2>
                                //             </span>
                                //             <span class="hiScore">
                                //                 <h4>Rating Score</h4>
                                //                 <h2 class="historyNo">${percentageRating}%</h2>
                                //             </span>
                                //         </div>    
                                //         <div>
                                //             <h4 class="AIsuggest" style="text-align: center;">${AI_suggestions}</h4>
                                //         </div>
                                //         <button style="margin-left: 25vw;" class="takeExam" onclick="openUrl('history.html')">Continue</button>
                                //     </div>   

                                // `;

                                // modal.style.display = "flex";

                                // window.onclick = function(event) {
                                //     if (event.target == modal) {
                                //         openUrl('history.html')
                                //     }
                                // }

                                openUrl('history.html')
                            })
                            .catch(err => {
                                if (err) {
                                    console.log(err)
                                }
                            })

                    })
                    .catch(err => {
                        if (err) {
                            console.log(err)
                        }
                    })

            } else {

                openUrl('login.html');

            }

        });

    }

}

function countDown() {

    var time = document.querySelector('#time');

    let timeLeft = setInterval(() => {
        var t = time.textContent;

        t = t.split(":");

        min = parseInt(t[0]);
        sec = parseInt(t[1]);

        if (sec > 0) {
            sec--;
        } else if (min > 0) {
            min--;
            sec = 59;
        } else {
            submitExam();
            clearInterval(timeLeft);
        }

        // to append additional zero
        min = '0'.repeat(2 - min.toString().length) + min;
        sec = '0'.repeat(2 - sec.toString().length) + sec;

        // add red effect
        if (parseInt(min) <= 5 && !(time.classList.contains('hurryUp'))) {
            time.classList.add("hurryUp");
        }

        time.innerHTML = min + ':' + sec;

    }, 995);

}

function getExams() {

    // does authetication
    checkCurrentUser();

    var examBody = document.querySelector('#currentQuestion');
    var preloader = document.querySelector("#preloader");

    // calls the function that parses and returns the match parameter
    var subject = parseUrl('subject');

    var time = document.querySelector('#timer');

    if (subject == null) {
        openUrl('selection.html');
    }

    // baseURL = https://questions.aloc.ng/api/v2/
    // questions = q?subject=blah     returns 1 question
    // questions = q/5?subject=blah    returns 5 question
    // questions = m?subject=blah      returns 40 questions
    // the body of the response is a bit different, also the larger the questions the more time it will take but it typically takes a few seconds

    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://questions.aloc.com.ng/api/v2/m?subject=${subject}`, true);
    // specifies a bunch of additional header info
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('AccessToken', 'ALOC-b34f725ffdb8b5a120c4');
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {

            if (this.status == 200) {

                var data = JSON.parse(this.responseText);

                // checks if the returned data is correct
                if (data.status == 200) {

                    preloader.classList.add("hide");

                    time.classList.remove('hide');
                    countDown();
                    // lol this is not wrong there is a data object in the first data object
                    data = data.data;

                    for (let index = 0; index < data.length; index++) {
                        const q = data[index];

                        correctAnswers[index] = q.answer;

                        // question id will be sequential i will make it myself
                        var newQuestion = `
                            <div id="q${index}" class="examContainer hide" align="left">
                                <p id="question${index}"><small class="qNo">${index+1}</small>${q.question}</p>
        
                                <form class="eForm"onsubmit="return False" id="formfor${index}">
                                    <!-- Make us of a loop incase options are more than four -->
                                    <input type="radio" name="ans" id="opta${index}" class="examRadio" value="a"> 
                                    <label for="opta${index}">${q.option.a}</label>
                                    <br>
                                    <input type="radio" name="ans" id="optb${index}" class="examRadio" value="b"> 
                                    <label for="optb${index}">${q.option.b}</label>
                                    <br>
                                    <input type="radio" name="ans" id="optc${index}" class="examRadio" value="c"> 
                                    <label for="optc${index}">${q.option.c}</label>
                                    <br>
                                    <input type="radio" name="ans" id="optd${index}" class="examRadio" value="d"> 
                                    <label for="optd${index}">${q.option.d}</label>
                                    <input type="radio" name="hint" id="hintInput${index}" value="false" hidden> 
                                    <br>
                                </form>
                                <br>
        
                                <div class="btns row">
                                    <button onclick="prevQuestion(${index})" class="examA">Previous</button>
                                    <button onclick="nextQuestion(${index})" class="examA">Next</button>
                                  
                                </div>
        
                                <div id='hintDiv${index}' class='hintDiv hide'></div>
                            </div>
                        `;

                        examBody.innerHTML += newQuestion;

                    }

                    var jumpTo = document.createElement('div');
                    jumpTo.classList.add('jumpTo');

                    for (let index = 0; index < data.length; index++) {

                        jumpTo.innerHTML += `<button id="qNoBtn${index}" class="qNoBtn" onclick="jumpTo(${index})">${index+1}</button>`;

                    }

                    examBody.appendChild(jumpTo);

                    document.querySelector('#q0').classList.remove('hide'); // this makes the first question visible
                    examBody.innerHTML += `
                        
                        <button class="sExam" onclick="preSubmit()">Submit Exam</button>
        
                    `;

                }

            } else {
                preloader.classList.add("hide");

                alert("Exams could not be loaded correctly, please try again")
            }

        }
    };
    xhr.send();

}

function getHistory() {

    var historyBox = document.querySelector('#historySection');

    var preloader = document.querySelector('#preloader');

    auth.onAuthStateChanged(user => {

        if (user) {

            var userId = user.uid;

            const recordsDB = db.ref('records/' + userId + '/');

            recordsDB.get()
                .then(snapshot => {

                    if (snapshot.exists()) {

                        // hide preloader
                        preloader.classList.add('hide');

                        var data = snapshot.val();

                        for (let index = 0; index < data.length; index++) {
                            const element = data[index];

                            // removes additional text from date
                            var date = data[index].date.replace(/\sGMT.*/, '');

                            var percentageScore = (data[index].score / 40) * 100;
                            percentageScore = percentageScore.toFixed(2);

                            var percentageRating = (data[index].rating) * 1;
                            percentageRating = percentageRating.toFixed(2);

                            historyBox.innerHTML += `

                                <div class="historyCard">
                                    <p class="historySubject"><b>${data[index].examName}</b></p>
                                    <p class="historyDate"><small>${date}</small></p>
                                    <br>
                                    <div class="historyallScore">
                                        <span class="hiScore">
                                            <h4>Normal Score</h4>
                                            <h2 class="historyNo">${data[index].score}/40</h2>
                                        </span>
                                        <span class="hiScore">
                                            <h4>Percentage Score</h4>
                                            <h2 class="historyNo">${percentageScore}%</h2>
                                        </span>
                                        <span class="hiScore">
                                            <h4>Rating Score</h4>
                                            <h2 class="historyNo">${percentageRating}%</h2>
                                        </span>
                                    </div>    
                                    <div>
                                        <h4 class="AIsuggest">${data[index].AI_suggestions}</h4>
                                    </div>
                                    <button class="takeExam" onclick="openUrl('exam.html?subject=${data[index].examName}')">Try an Exam</button>
                                </div>        

                            `;

                        }

                    } else {
                        // empty history page
                        preloader.classList.add('hide');

                        historyBox.innerHTML += '<h4 class="errText">Oops! No Exams Yet Head on and take one.</h4>'
                    }
                })
                .catch(err => {
                    if (err) console.log(err);
                })

        } else {
            openUrl('register.html')
        }
    })

}

function showHideLevelCheckboxes() {
    var roleSelect = document.getElementById('role');
    var studentLevelsRow = document.getElementById('studentLevelsRow');
    var teacherLevelsRow = document.getElementById('teacherLevelsRow');
    var facultySessionRow = document.getElementById('facultySessionRow');
    var courseSelectionRow = document.getElementById('courseSelectionRow');
    var courseTakenRow = document.getElementById('courseTakenRow');
    var departmentRow = document.getElementById('departmentRow');
    var departmentInput = document.querySelector('input[name="department"]');

    if (roleSelect.value === 'student') {
        studentLevelsRow.style.display = 'table-row';
        teacherLevelsRow.style.display = 'none';
        facultySessionRow.style.display = 'table-row';
        courseSelectionRow.style.display = 'table-row';
        departmentRow.style.display = 'table-row';
        departmentInput.required = true; // Ensure the field is required for students
        courseTakenRow.style.display = 'none';
        teachingFaculty.style.display = 'none';
    } else if (roleSelect.value === 'teacher') {
        studentLevelsRow.style.display = 'none';
        teacherLevelsRow.style.display = 'table-row';
        teachingFaculty.style.display = 'table-row';
        facultySessionRow.style.display = 'none';
        courseTakenRow.style.display = 'table-row';
        departmentRow.style.display = 'none';
        departmentInput.required = false; // Remove the required attribute for teachers
        courseSelectionRow.style.display = 'none';
    }
}