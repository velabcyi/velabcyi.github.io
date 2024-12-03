import os
import shutil
import re

# Paths
source_dir = 'source'
output_dir = '.'  # Assuming the script runs from the source directory

# Languages
languages = ['en', 'el']

def clear_directory(directory):
    """
    Removes all content from the specified directory, including files and subdirectories.
    """
    for item in os.listdir(directory):
        item_path = os.path.join(directory, item)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)  # Recursively delete directory contents
        else:
            os.remove(item_path)  # Delete a file

def load_content(file_path):
    """
    Loads content from a file if it exists, using UTF-8 encoding.
    """
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    return ''

def create_redirect_html(lang, path):
    """
    Creates an HTML file for redirection based on the language (en or el).
    """
    if lang not in ['en', 'el']:
        raise ValueError("Language must be 'en' or 'el'")

    common_head = f'''
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/css/style.css">
    <meta property="og:image" content="images/velab-logo-white-tightcrop.png">
    <meta property="og:url" content="https://velab.cloud">
    <meta property="og:type" content="website">
    '''

    content = {
        'en': {
            'title': "Virtual Environments Lab",
            'description': "At the Virtual Environments Lab, we support European efforts in architectural heritage preservation and urban transformation through advanced digital solutions. Our mission includes developing tools to combat heritage decay, enhancing urban resilience, and promoting education in historic digital transitions. We focus on immersive visualization, interactive narratives, and creating digital twins to integrate tangible and intangible heritage.",
            'og_title': "Virtual Environments Lab – Preserving European Architectural Heritage",
            'og_description': "Supporting European urban heritage through advanced digital tools aimed at safeguarding, understanding, and transforming historic sites. Discover our innovative approaches to architectural preservation and education."
        },
        'el': {
            'title': "VELAB: Φόρμα κατάθεσης και μεταφόρτωσης πληροφοριών",
            'description': "Στο Virtual Environments Lab, υποστηρίζουμε τις ευρωπαϊκές προσπάθειες για τη διατήρηση της αρχιτεκτονικής κληρονομιάς και τον αστικό μετασχηματισμό μέσω προηγμένων ψηφιακών λύσεων. Η αποστολή μας περιλαμβάνει την ανάπτυξη εργαλείων για την κατανόηση της επίδρασης της μη χρήσης, των ανθρωπογενών και περιβαλλοντικών παραγόντων καθώς και της αλλαγής του κλίματος στην αρχιτεκτονική μας κληρονομιά, την ενίσχυση της αστικής ανθεκτικότητας και την προώθηση της εκπαίδευσης για την ψηφιακή μετάβαση. Εστιάζουμε στην εμβυθιστική οπτικοποίηση, στις διαδραστικές αφηγήσεις και στη δημιουργία ψηφιακών διδύμων για την ανοικτή πρόσβαση στην ενσωμάτωση της υλικής και άυλης κληρονομιάς.",
            'og_title': "Virtual Environments Lab – Διατήρηση της Ευρωπαϊκής Αρχιτεκτονικής Κληρονομιάς",
            'og_description': "Υποστήριξη της Ευρωπαϊκής αρχιτεκτονικής κληρονομιάς αστικών τοπίων μέσω προηγμένων ψηφιακών εργαλείων που στοχεύουν στη διαφύλαξη, κατανόηση και επανάχρηση ιστορικών περιβαλλόντων. Ανακαλύψτε τις καινοτόμες προσεγγίσεις μας για την αρχιτεκτονική διατήρηση και ψηφιακή εκπαίδευση."
        }
    }

    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
    {common_head}
    <title>{content[lang]['title']}</title>
    <meta name="description" content="{content[lang]['description']}">
    <meta property="og:title" content="{content[lang]['og_title']}">
    <meta property="og:description" content="{content[lang]['og_description']}">
    <script>
    document.addEventListener('DOMContentLoaded', function () {{
        const userLang = navigator.language || navigator.userLanguage;
        const langCode = userLang.startsWith('el') ? 'el' : 'en';
        window.location.replace('{path}/' + langCode + '/');
    }});
    </script>
    <noscript>
    <meta http-equiv="refresh" content="0; url={path}/{lang}/">
    </noscript>
</head>
<body style="background-color: black">
</body>
</html>'''

def generate_language_toggle_url(current_url, current_lang):
    """
    Generates the URL for the language toggle button.
    
    Args:
    current_url (str): The current page's URL path (e.g., '/home/index.html' or '/about/' or '/nic/upload.html')
    current_lang (str): The current language ('en' or 'el')
    
    Returns:
    str: The URL for the other language version of the current page
    """
    other_lang = 'el' if current_lang == 'en' else 'en'
    
    # Remove leading slash if present
    if current_url.startswith('/'):
        current_url = current_url[1:]
    
    # Split the URL into parts
    parts = current_url.split('/')
    
    # Handle the last part (file or directory name)
    if parts[-1] == 'index.html':
        # Remove 'index.html' and replace or append the language code
        parts.pop()
        if parts and parts[-1] in ['en', 'el']:
            parts[-1] = other_lang
        else:
            parts.append(other_lang)
    elif '.' in parts[-1]:
        # It's a file, insert the language code before the filename
        filename = parts.pop()
        if parts and parts[-1] in ['en', 'el']:
            parts[-1] = other_lang
        else:
            parts.append(other_lang)
        parts.append(filename)
    else:
        # It's a directory, just append the language code
        if parts and parts[-1] in ['en', 'el']:
            parts[-1] = other_lang
        else:
            parts.append(other_lang)
    
    # Reconstruct the URL
    new_url = '/' + '/'.join(parts)
    
    # Ensure the URL ends with a trailing slash if it's not pointing to a file
    if '.' not in parts[-1]:
        new_url += '/'
    
    return new_url

def inject_content(html_content, header, footer, page_path, current_lang):
    """
    Injects header, footer, language toggle button, and counter script into the HTML content.
    The language toggle is always injected, while the header content is only injected if the <header> tag is empty.
    """
    # Regular expressions to find header, footer, and body close tags
    header_pattern = re.compile(r'<header>.*?</header>', re.IGNORECASE | re.DOTALL)
    footer_pattern = re.compile(r'<footer>\s*</footer>', re.IGNORECASE)
    body_close_pattern = re.compile(r'</body>', re.IGNORECASE)

    # Generate language toggle URL
    other_lang = 'el' if current_lang == 'en' else 'en'
    toggle_url = generate_language_toggle_url(page_path, current_lang)

    # Create language toggle button
    lang_toggle = f'''
    <div class="lang-toggle">
        <a href="{toggle_url}" class="lang-button">
            {other_lang.upper()}
        </a>
    </div>
    '''

    # Function to replace or append to header
    def header_replacement(match):
        existing_header = match.group(0)
        if existing_header.strip() == '<header></header>':
            # If header is empty, inject both header content and language toggle
            return f'<header>{header}{lang_toggle}</header>'
        else:
            # If header has content, only inject language toggle
            return existing_header[:-9] + lang_toggle + '</header>'

    # Replace or append to header
    html_content = header_pattern.sub(header_replacement, html_content)

    # If no header tag found, add one with the language toggle
    if '<header>' not in html_content:
        html_content = f'<header>{lang_toggle}</header>{html_content}'

    # Check if the <footer> tag is empty and inject footer content if it is
    if footer_pattern.search(html_content):
        html_content = footer_pattern.sub(f'<footer>{footer}</footer>', html_content)

    # Inject the counter script before the closing </body> tag
    counter_script = f'''
    <script>
    (function() {{
        function sendCount(url) {{
            if (navigator.sendBeacon) {{
                navigator.sendBeacon(url);
            }} else {{
                fetch(url, {{ method: 'POST', keepalive: true }}).catch(error => console.error('Error:', error));
            }}
        }}

        function loadCounter() {{
            const url = 'https://colter.us/ex/count.php?p=' + encodeURIComponent('{page_path}');
            sendCount(url);
        }}

        if (document.readyState === 'complete') {{
            loadCounter();
        }} else {{
            window.addEventListener('load', loadCounter);
        }}

        // Optionally, you can also send the count when the user is leaving the page
        window.addEventListener('unload', function() {{
            const url = 'https://colter.us/ex/count.php?p=' + encodeURIComponent('{page_path}');
            sendCount(url);
        }});
    }})();
    </script>
    '''
    html_content = body_close_pattern.sub(f'{counter_script}</body>', html_content)

    return html_content
def process_files(source, target, lang, current_path=''):
    """
    Copies and renames files as necessary to the correct language-specific directories.
    """
    header = load_content(f'./source/header-{lang}.html')
    footer = load_content(f'./source/footer-{lang}.html')

    for item in os.listdir(source):
        source_path = os.path.join(source, item)
        if os.path.isdir(source_path):
            new_path = os.path.join(current_path, item)
            target_path = os.path.join(target, item)
            if not os.path.exists(target_path):
                os.makedirs(target_path)
            process_files(source_path, target_path, lang, new_path)  # Recurse into subdirectories
        else:
            target_filename = item.replace(f'-{lang}.html', '.html')
            if item.endswith(f'-{lang}.html'):  # Language specific HTML file
                page_path = os.path.join(current_path, target_filename)
                with open(source_path, 'r', encoding='utf-8') as file:
                    content = inject_content(file.read(), header, footer, page_path, lang)
                with open(os.path.join(target, target_filename), 'w', encoding='utf-8') as output_file:
                    output_file.write(content)
            elif not item.__contains__('-'): #doesnt hyphenate
                shutil.copy2(source_path, os.path.join(target, item))  # Copy other files


# Main Execution
if __name__ == "__main__":
    pages = ['home', 'nic', 'privacy', 'contact','lighthouse', 'nicworkshop']

    # Clearing directories before compiling new content
    for subdir in pages:
        os.makedirs(os.path.join(output_dir, subdir), exist_ok=True)
        for lang in languages:
            target_subdir = os.path.join(output_dir, subdir, lang)
            os.makedirs(target_subdir, exist_ok=True)
            if os.path.exists(target_subdir):
                clear_directory(target_subdir)

    # Processing files and directories
    for subdir in pages:
        source_subdir = os.path.join(source_dir, subdir)
        for lang in languages:
            target_subdir = os.path.join(output_dir, subdir, lang)
            process_files(source_subdir, target_subdir, lang, f'/{subdir}')


    # Create redirection index.html for the main site and each subdirectory
    with open(os.path.join(output_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(create_redirect_html('en', '/home'))

    for subdir in pages:
        target_subdir = os.path.join(output_dir, subdir)
        with open(os.path.join(target_subdir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(create_redirect_html('en', f'/{subdir}'))
