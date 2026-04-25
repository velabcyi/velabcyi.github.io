document.addEventListener('DOMContentLoaded', function() {
    const signupModal = document.getElementById('signupModal');
    const creditsModal = document.getElementById('creditsModal');
    const signupBtn = document.getElementById('signup-button');
    const creditsBtn = document.getElementById('credits-button');
    const closeBtns = document.getElementsByClassName('close');
    const form = document.getElementById('signupForm');
    const logURL = 'https://colter.us/log/';

    const pageLanguage = document.documentElement.lang || 'en';

    const translations = {
        en: {
            fillAllFields: 'Please fill in all fields',
            enterValidEmail: 'Please enter a valid email address',
            signupSuccessful: 'Thank you! You have been added to our mailing list.',
            tryAgain: 'An error occurred. Please try again.',
            reasonTooLong: 'Your description must be less than 500 characters'
        },
        el: {
            fillAllFields: 'Παρακαλώ συμπληρώστε όλα τα πεδία',
            enterValidEmail: 'Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email',
            signupSuccessful: 'Ευχαριστούμε! Έχετε προστεθεί στη λίστα αλληλογραφίας μας.',
            tryAgain: 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.',
            reasonTooLong: 'Η περιγραφή σας πρέπει να είναι μικρότερη από 500 χαρακτήρες'
        }
    };

    const t = translations[pageLanguage] || translations.en;

    signupBtn.onclick = function() {
        signupModal.style.display = 'block';
    }

    creditsBtn.onclick = function() {
        creditsModal.style.display = 'block';
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

        if (name.trim() === '' || email.trim() === '' || reason.trim() === '') {
            alert(t.fillAllFields);
            return false;
        }

        if (!isValidEmail(email)) {
            alert(t.enterValidEmail);
            return false;
        }

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
        const userName = document.getElementById('name').value;
        const userEmail = document.getElementById('email').value;
        const userReason = document.getElementById('reason').value;

        fetch(logURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: 'nic_mailing_list',
                title: `Mailing List: ${userName}`,
                message: `Name: ${userName}\nEmail: ${userEmail}\nConnection: ${userReason}`
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(t.signupSuccessful);
            form.reset();
            signupModal.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            alert(t.tryAgain);
        });
    }
});
