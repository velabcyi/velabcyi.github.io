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
    Loads content from a file if it exists.
    """
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            return file.read()
    return ''

def create_redirect_html(lang, path):
    """
    Creates an HTML file for redirection based on the language.
    """
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/css/style.css">
    <title>Virtual Environments Lab</title>
    <meta name="description" content="At the Virtual Environments Lab, we support European efforts in architectural heritage preservation and urban transformation through advanced digital solutions. Our mission includes developing tools to combat heritage decay, enhancing urban resilience, and promoting education in historic digital transitions. We focus on immersive visualization, interactive narratives, and creating digital twins to integrate tangible and intangible heritage.">
    <meta property="og:title" content="Virtual Environments Lab – Preserving European Architectural Heritage">
    <meta property="og:description" content="Supporting European urban heritage through advanced digital tools aimed at safeguarding, understanding, and transforming historic sites. Discover our innovative approaches to architectural preservation and education.">
    <meta property="og:image" content="/images/image5.jpg">
    <meta property="og:url" content="https://velab.cloud">
    <meta property="og:type" content="website">
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

import re

def inject_content(html_content, header, footer):
    """
    Injects header and footer into the HTML content if the respective <header> or <footer>
    tags are empty.
    """
    # Regular expressions to find empty <header> and <footer> tags
    header_pattern = re.compile(r'<header>\s*</header>', re.IGNORECASE)
    footer_pattern = re.compile(r'<footer>\s*</footer>', re.IGNORECASE)

    # Check if the <header> tag is empty and inject header content if it is
    if header_pattern.search(html_content):
        html_content = header_pattern.sub(f'<header>{header}</header>', html_content)

    # Check if the <footer> tag is empty and inject footer content if it is
    if footer_pattern.search(html_content):
        html_content = footer_pattern.sub(f'<footer>{footer}</footer>', html_content)

    return html_content


def process_files(source, target, lang):
    """
    Copies and renames files as necessary to the correct language-specific directories.
    """
    header = load_content(f'./source/header-{lang}.html')
    footer = load_content(f'./source/footer-{lang}.html')

    for item in os.listdir(source):
        source_path = os.path.join(source, item)
        if os.path.isdir(source_path):
            target_path = os.path.join(target, item)
            if not os.path.exists(target_path):
                os.makedirs(target_path)
            process_files(source_path, target_path, lang)  # Recurse into subdirectories
        else:
            target_filename = item.replace(f'-{lang}.html', '.html')
            if item.endswith(f'{lang}.html'):  # Language specific HTML file
                with open(source_path, 'r') as file:
                    content = inject_content(file.read(), header, footer)
                with open(os.path.join(target, target_filename), 'w') as output_file:
                    output_file.write(content)
            elif not item.startswith('index-') and not item.endswith('.html'):
                shutil.copy2(source_path, os.path.join(target, item))  # Copy other files

# Main Execution
if __name__ == "__main__":
    pages = ['home', 'nic', 'privacy', 'contact', 'upload']

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
            process_files(source_subdir, target_subdir, lang)

    # Create redirection index.html for the main site and each subdirectory
    with open(os.path.join(output_dir, 'index.html'), 'w') as f:
        f.write(create_redirect_html('en', '/home'))

    for subdir in pages:
        target_subdir = os.path.join(output_dir, subdir)
        with open(os.path.join(target_subdir, 'index.html'), 'w') as f:
            f.write(create_redirect_html('en', f'/{subdir}'))
