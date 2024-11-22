// signup.js
document.addEventListener('DOMContentLoaded', function() {
    const signupModal = document.getElementById('signupModal');
    const creditsModal = document.getElementById('creditsModal');
    const signupBtn = document.getElementById('signup-button');
    const creditsBtn = document.getElementById('credits-button');
    const closeBtns = document.getElementsByClassName('close');
    const form = document.getElementById('signupForm');
    const signupCountElement = document.getElementById('signupCount');
    const creditsListElement = document.getElementById('creditsList');
    const signupURL = 'https://colter.us/ex/nicworkshop/signup.php';

    // Check page language
    const pageLanguage = document.documentElement.lang || 'en';
    
    // Translations
    const translations = {
        en: {
            signUp: 'Express Interest in Attending',
            workshopFull: 'Interest List Full',
            seatsRemain: 'spots available for interest registration',
            fillAllFields: 'Please fill in all fields',
            enterValidEmail: 'Please enter a valid email address',
            signupSuccessful: 'Thank you for your interest! We will contact selected participants via email.',
            error: 'Error:',
            tryAgain: 'An error occurred. Please try again.',
            unableToRetrieveCount: 'Unable to retrieve registration count',
            reasonTooLong: 'Your description must be less than 500 characters',
            reasonTooShort: 'Your description must be at least 50 characters'
        },
        el: {
            signUp: 'Εκδήλωση Ενδιαφέροντος',
            workshopFull: 'Η Λίστα Ενδιαφέροντος είναι Πλήρης',
            seatsRemain: 'θέσεις διαθέσιμες για εκδήλωση ενδιαφέροντος',
            fillAllFields: 'Παρακαλώ συμπληρώστε όλα τα πεδία',
            enterValidEmail: 'Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email',
            signupSuccessful: 'Ευχαριστούμε για το ενδιαφέρον σας! Θα επικοινωνήσουμε με τους επιλεγμένους συμμετέχοντες μέσω email.',
            error: 'Σφάλμα:',
            tryAgain: 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.',
            unableToRetrieveCount: 'Αδυναμία ανάκτησης αριθμού εγγραφών',
            reasonTooLong: 'Η περιγραφή σας πρέπει να είναι μικρότερη από 500 χαρακτήρες',
            reasonTooShort: 'Η περιγραφή σας πρέπει να είναι τουλάχιστον 50 χαρακτήρες'
        }
    };

    // Get translation based on page language
    const t = translations[pageLanguage] || translations.en;

    updateSignupCount();

    signupBtn.onclick = function() {
        signupModal.style.display = 'block';
    }

    creditsBtn.onclick = function() {
        creditsModal.style.display = 'block';
        fetchCredits();
    }

    Array.from(closeBtns).forEach(btn => {
        btn.onclick = function() {
            signupModal.style.display = 'none';
            creditsModal.style.display = 'none';
        }
    });

    window.onclick = function(event) {
        if (event.target == signupModal) {
            signupModal.style.display = 'none';
        }
        if (event.target == creditsModal) {
            creditsModal.style.display = 'none';
        }
    }

    form.onsubmit = function(e) {
        e.preventDefault();
        if (validateForm()) {
            submitForm();
        }
    }

    function validateForm() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const reason = document.getElementById('reason').value;
    
        // Check if any field is empty
        if (name.trim() === '' || email.trim() === '' || reason.trim() === '') {
            alert(t.fillAllFields);
            return false;
        }
    
        // Validate email format
        if (!isValidEmail(email)) {
            alert(t.enterValidEmail);
            return false;
        }
    
        // Validate reason length (min 50, max 500 characters)
        // if (reason.length < 50) {
        //     alert(t.reasonTooShort);
        //     return false;
        // }
        if (reason.length > 500) {
            alert(t.reasonTooLong);
            return false;
        }
    
        return true;
    }
    

    function isValidEmail(email) {
        const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        return re.test(email);
    }
    function submitForm() {
        const formData = new FormData(form);
        const userName = formData.get('name');
        const userEmail = formData.get('email');
        const userReason = formData.get('reason');
    
        fetch(signupURL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(t.signupSuccessful);
                form.reset();
                updateSignupCount();
                signupModal.style.display = 'none';
                
                // Send success notification with reason included
                sendNotification(
                    "nic_workshop_2024_signup",
                    `Signup Success: ${userName}`,
                    `New user signed up with email: ${userEmail}\nConnection: ${userReason}`
                );
            } else {
                alert(t.error + ' ' + data.message);
                
                // Send failure notification
                sendNotification(
                    "nic_workshop_2024_signup",
                    `Signup Failure: ${userName}`,
                    `Signup failed for email: ${userEmail}\nConnection: ${userReason}\nError: ${data.message}`
                );
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(t.tryAgain);
            
            // Send error notification
            sendNotification(
                "nic_workshop_2024_signup",
                `Signup Error: ${userName || 'Unknown'}`,
                `Error during signup process for email: ${userEmail || 'Unknown'}\nConnection: ${userReason || 'Unknown'}\nError: ${error.message}`
            );
        });
    }


    function sendNotification(appId, title, message) {
        const url = "https://colter.us/log/";
        const payload = {
            from: appId,
            title: title,
            message: message
        };

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .catch(error => {
            console.error('Error sending notification:', error);
            return { success: false, error: error.message };
        });
    }

    function updateSignupCount() {
        return; //we dont show this. too many signups.
        fetch(signupURL + '?action=getCount')
        .then(response => response.json())
        .then(data => {
            const count = data.count;
            signupBtn.textContent = `${t.signUp} | ${25-count} ${t.seatsRemain}`;
            if (count >= 25) {
                signupBtn.textContent = t.workshopFull;
                signupBtn.style.pointerEvents = 'none';
                signupBtn.style.opacity = '0.5';
                if (form) {
                    form.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            signupBtn.textContent = t.signUp;
            if (signupCountElement) {
                signupCountElement.textContent = t.unableToRetrieveCount;
            }
        });
    }

    function fetchCredits() {
        fetch(signupURL + '?action=getCredits')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayCredits(data.credits);
            } else {
                creditsListElement.innerHTML = `<p>${t.unableToRetrieveCredits}</p>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            creditsListElement.innerHTML = `<p>${t.errorRetrievingCredits}</p>`;
        });
    }

    function displayCredits(credits) {
        let html = '<ul>';
        credits.forEach(credit => {
            html += `<li>${credit.name} - ${credit.email}</li>`;
        });
        html += '</ul>';
        creditsListElement.innerHTML = html;
    }
});