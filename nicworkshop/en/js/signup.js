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
        if (name.trim() === '' || email.trim() === '') {
            alert('Please fill in all fields');
            return false;
        }
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
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
        fetch(signupURL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Signup successful!');
                form.reset();
                updateSignupCount();
                signupModal.style.display = 'none';
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    }

    function updateSignupCount() {
        fetch(signupURL + '?action=getCount')
        .then(response => response.json())
        .then(data => {
            const count = data.count;
            signupBtn.textContent = `Sign Up (${25-count} seats remain)`;
            if (count >= 25) {
                signupBtn.textContent = 'Workshop Full';
                signupBtn.style.pointerEvents = 'none';
                signupBtn.style.opacity = '0.5';
                if (form) {
                    form.style.display = 'none';
                }
            }
            // if (signupCountElement) {
            //     signupCountElement.textContent = `Current signups: ${count}`;
            // }
        })
        .catch(error => {
            console.error('Error:', error);
            signupBtn.textContent = 'Sign Up';
            if (signupCountElement) {
                signupCountElement.textContent = 'Unable to retrieve signup count';
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
                creditsListElement.innerHTML = '<p>Unable to retrieve credits.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            creditsListElement.innerHTML = '<p>An error occurred while retrieving credits.</p>';
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