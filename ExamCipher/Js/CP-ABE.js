//Exam Encrypt
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', function() {
        // Safely access checked inputs
        const studyLevelElement = registerForm.querySelector('input[name="study-level"]:checked');
        const genderElement = registerForm.querySelector('input[name="Gender"]:checked');

        // Capture form data
        const userData = {
            role: registerForm['role'].value,
            studyLevel: studyLevelElement ? studyLevelElement.value : '',
            faculty: registerForm['faculty'].value,
            department: registerForm['department'].value,
            courses: Array.from(registerForm.querySelectorAll('input[name="course"]:checked, input[name="taughtCourse"]:checked')).map(el => el.value),
            teachLevels: Array.from(registerForm.querySelectorAll('input[name="teach-level"]:checked')).map(el => el.value),
            dob: registerForm['BirthDay'].value
        };

        // Store in localStorage and log to console
        localStorage.setItem('registeredUser', JSON.stringify(userData));
        console.log('User data stored:', userData);
    });
});
//security questions Reg
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the submit button
    const submitButton = document.getElementById('submitbtn1');
    submitButton.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default form submission

        // Collect form data
        const churchName = document.querySelector('input[name="churchName"]').value;
        const favoriteColor = document.querySelector('input[name="favoriteColor"]').value;
        const bestFriendName = document.querySelector('input[name="bestFriendName"]').value;
        const parentsMeetCity = document.querySelector('input[name="parentsMeetCity"]').value;

        // Store the security questions answers in local storage
        const securityQuestions = {
            churchName: churchName,
            favoriteColor: favoriteColor,
            bestFriendName: bestFriendName,
            parentsMeetCity: parentsMeetCity
        };
        localStorage.setItem('securityQuestions', JSON.stringify(securityQuestions));

        // Redirect to homepage
        window.location.href = '../homepage.html';
    });
});

// security questions
document.addEventListener('DOMContentLoaded', function() {
    const securityQuestions = JSON.parse(localStorage.getItem('securityQuestions'));
    if (!securityQuestions) {
        console.error('No security questions found. Redirecting to registration.');
        window.location.href = '../pages/register.html'; // Redirect to registration if no questions found
        return;
    }

    // Array of question keys and their corresponding human-readable text
    const questionsArray = [
        { key: 'churchName', text: 'What is the name of the church you attend?' },
        { key: 'favoriteColor', text: 'What is your favorite color?' },
        { key: 'bestFriendName', text: "What is your best friend's name?" },
        { key: 'parentsMeetCity', text: 'In what city did your parents meet?' }
    ];

    // Select a random question
    const randomIndex = Math.floor(Math.random() * questionsArray.length);
    const selectedQuestion = questionsArray[randomIndex];

    // Display the question
    const questionTextElement = document.getElementById('questionText');
    questionTextElement.textContent = selectedQuestion.text;

    const securityQuestionForm = document.getElementById('securityQuestionForm');
    const answerInput = document.getElementById('answerInput');

    securityQuestionForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission

        // Check if the answer is correct
        if (answerInput.value.toLowerCase() === securityQuestions[selectedQuestion.key].toLowerCase()) {
            // Correct answer
            window.location.href = '../homepage.html'; // Redirect to homepage
        } else {
            // Incorrect answer
            Swal.fire({
                icon: 'error',
                title: 'Incorrect Answer',
                text: 'The answer provided does not match our records.',
            }).then(() => {
                window.location.href = '../pages/login.html'; // Redirect to login page
            });
        }
    });
});