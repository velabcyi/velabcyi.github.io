Project Overview

This project facilitates the creation and management of datasets on a Clowder server through a secure proxy (Express app) that handles sensitive operations. It is structured into three main components:

    Static Webpage Client: A GitHub-hosted page with a web form that users interact with to submit datasets.
    Node.js Express App: Serves as a proxy to handle requests that require elevated permissions, such as creating datasets and adding them to specific spaces, as well as adding metadata.
    Clowder Server: Hosts and manages the datasets and files.

Key Components
1. Static Webpage Client

    Function: Provides a user interface for inputting dataset information and uploading files.
    Technology: HTML, JavaScript.
    Features:
        Form submission for dataset creation and metadata addition.
        File upload interface that interacts directly with the Clowder server using limited permissions API keys.

2. Node.js Express App (clowderapi@web.illinois.edu)

    Function: Acts as a secure intermediary that uses a privileged API key to interact with the Clowder server for creating datasets and adding metadata.
    Endpoints:
        POST /api/dataset/create: Receives data from the client, creates a dataset in a specified space, and returns a URL with a limited permissions API key for file uploading.
        POST /api/dataset/:datasetId/metadata: Adds metadata to an existing dataset.
    Security: Uses an API key with broader permissions that should not be exposed to the client.
    Module: Utilizes a clowder.js module for making API calls to the Clowder server.

3. Clowder Server

    Function: Manages the storage and retrieval of datasets and associated files.
    Interactions:
        Receives direct file uploads from the static webpage client using a URL and key provided by the Express app.
        API key used here is limited to adding files to existing datasets.

Security Model

    Two API Keys:
        Cloud Contributor Key: Used exclusively by the Express app to create datasets and add metadata.
        File Uploader Key: A restricted key that only allows uploading files to already created datasets. This key is returned to the client for uploading files directly to the Clowder server.

Development Notes

    clowder.js Module:
        Used in the Express app to abstract and simplify API calls to the Clowder server.
    clowder.js class
        Used for client side clowder interactions


