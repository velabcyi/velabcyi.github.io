import os
import shutil

# Paths
source_dir = 'source'
output_dir = '.'  # Assuming the script runs from the source directory

# Languages
languages = ['en', 'gr']

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
    <title>Redirecting...</title>
    <script>
        document.addEventListener('DOMContentLoaded', function () {{
            const userLang = navigator.language || navigator.userLanguage;
            const langCode = userLang.startsWith('el') ? 'gr' : 'en';
            //window.location.href = '{path}/' + langCode + '/';
            window.location.replace('{path}/' + langCode + '/');
        }});
    </script>
    <noscript>
        <meta http-equiv="refresh" content="0; url={path}/{lang}/">
    </noscript>
</head>
<body>
    <h1>Redirecting...</h1>
</body>
</html>'''

def process_files(source, target, lang):
    """
    Copies and renames files as necessary to the correct language-specific directories.
    """
    for item in os.listdir(source):
        source_path = os.path.join(source, item)
        if os.path.isdir(source_path):
            target_path = os.path.join(target, item)
            if not os.path.exists(target_path):
                os.makedirs(target_path)
            process_files(source_path, target_path, lang)  # Recurse into subdirectories
        else:
            if item == f'index-{lang}.html':  # Specific language index file
                shutil.copy2(source_path, os.path.join(target, 'index.html'))
            elif item.startswith('index-'):
                continue  # Skip other language-specific index files
            else:
                shutil.copy2(source_path, os.path.join(target, item))  # Copy other files

# Main Execution
if __name__ == "__main__":
    pages = ['home', 'nic', 'privacy', 'contact']

    # Clearing directories before compiling new content
    for subdir in pages:
        os.makedirs(os.path.join(output_dir, subdir), exist_ok=True)  # Creates the directory if it doesn't exist
        for lang in languages:
            target_subdir = os.path.join(output_dir, subdir, lang)
            os.makedirs(os.path.join(output_dir, subdir, lang), exist_ok=True)  # Creates the directory if it doesn't exist
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
