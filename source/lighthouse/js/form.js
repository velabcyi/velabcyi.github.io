// FORM VALIDATION
// Function to validate required fields
function validateForm() {
    console.log("validating form");
    const form = document.getElementById('mediaForm');
    const subjectInput = document.getElementById('subject');
    const emailInput = document.getElementById('email');
    const rightsSelect = document.getElementById('tags');
    const submitBtn = document.getElementById('submitBtn');
  
    // Function to validate email format
    function isEmailValid(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    // Function to update label text with asterisk
    function updateLabelText(inputId, isValid) {
      const label = document.querySelector(`label[for="${inputId}"]`);
      if (label) {
        const labelText = label.textContent;
        const asteriskIndex = labelText.lastIndexOf('*');
        if (asteriskIndex !== -1) {
          label.textContent = labelText.slice(0, asteriskIndex);
        }
        if (!isValid) {
          label.innerHTML += '<span style="color: red;">*</span>';
        } else {
          label.innerHTML += '<span style="color: black;">*</span>';
        }
      }
    }
  
    // Validate subject
    const isSubjectValid = subjectInput.value.trim() !== '';
    updateLabelText('subject', isSubjectValid);
  
    // Validate email
    const isEmailInputValid = emailInput.value.trim() !== '' && isEmailValid(emailInput.value.trim());
    updateLabelText('email', isEmailInputValid);
  
    // Validate rights and contributor info
    let isRightsValid = rightsSelect.value !== '';
    updateLabelText('tags', isRightsValid);
  
    if (isSubjectValid && isEmailInputValid && isRightsValid) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    } else {
      submitBtn.disabled = true;
      submitBtn.textContent = "Fill out required* fields to submit.";
    }
  }
  
  // Add event listeners to required fields
  document.getElementById('subject').addEventListener('input', validateForm);
  document.getElementById('email').addEventListener('input', validateForm);
  document.getElementById('tags').addEventListener('change', validateForm);

  async function submitForm() {
    const apiUrl = 'https://clowderapi.web.illinois.edu/api/dataset/create';
    const datasetName = document.getElementById('subject').value || 'Default Dataset Name';
    const datasetDesc = document.getElementById('text').value || 'No Description Provided';
    const email = document.getElementById('email').value;
    const tagsSelect = document.getElementById('tags');
    const rights = Array.from(tagsSelect.selectedOptions).map(option => option.value);
    console.log("Submitting form");

    // Validate inputs here if necessary
    try {
        document.getElementById('loadingOverlay').classList.remove('hidden');
        document.getElementById('mediaForm').querySelectorAll('input, textarea, button, select').forEach(element => {
          element.disabled = true;
        });

        // Disable submit button and show a loading indicator
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('loadingIndicator').style.display = 'block';
        console.log("Creating Dataset");

        // Metadata handling
        const metadata = {
            data: {
                subject: datasetName,
                description: datasetDesc,
                userAgent: navigator.userAgent,
                language: navigator.language,
                email: email,
                tags: rights,
                uploadDate: new Date().toISOString()
            }
        };

        // Format the metadata as a string to include in the dataset description
        const metadataString = Object.entries(metadata.data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

        const enhancedDescription = `${metadataString}`;


        // API call to create dataset
        const createResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spaceId:"66645048e4b0d1566328c985", name: datasetName, description: enhancedDescription })
        });

        if (!createResponse.ok) {
            throw new Error(`HTTP status ${createResponse.status}`);
        }

        const dataset = await createResponse.json();
        // console.log('Created Dataset:', dataset);
        console.log('Created Dataset.');

        console.log("Uploading metadata");


        const metadataResponse = await fetch(`https://clowderapi.web.illinois.edu/api/dataset/${dataset.datasetId}/metadata/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata)
        });

        if (!metadataResponse.ok) {
            throw new Error(`Error adding metadata: ${metadataResponse.statusText}`);
        }
        console.log('Metadata added.');

        // Store some of the form data in local storage
        localStorage.setItem('lastSubmittedEmail', email);


        // File uploads
        await handleFileUploads(dataset.uploadUrl, dataset.key);
        //clear files, subject, description
        clearFiles();
        document.getElementById('subject').value = '';
        document.getElementById('text').value = '';


        alert('Upload and dataset creation successful!');
    } catch (error) {
        console.error('Error during form submission:', error);
        alert(`An error occurred: ${error.message}`);
    } finally {
        // Re-enable submit button and hide loading indicator
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('loadingOverlay').classList.add('hidden');
        document.getElementById('mediaForm').querySelectorAll('input, textarea, button, select').forEach(element => {
        element.disabled = false;
        });
    }
}
window.addEventListener('DOMContentLoaded', function() {  
    // Call validateForm() after a short delay (e.g., 100ms)
    setTimeout(validateForm, 100);
  });

