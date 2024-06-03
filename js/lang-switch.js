// js/lang-switch.js
document.addEventListener('DOMContentLoaded', function () {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.startsWith('el') ? 'gr' : 'en';
    const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');

    // Check if the language is already specified
    const isLangSpecified = pathSegments.includes('en') || pathSegments.includes('gr');

    if (!isLangSpecified) {
        if (pathSegments.length === 0) {
            // Redirect to the home page based on language
            window.location.href = `/${langCode}/`;
        } else {
            // Remove any index.html from the path segments
            const filteredPathSegments = pathSegments.filter(segment => segment !== 'index.html');

            // Redirect to the project page based on language
            window.location.href = `/${filteredPathSegments.join('/')}/${langCode}`;
        }
    }
});
