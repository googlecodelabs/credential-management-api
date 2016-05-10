# Credential Management API Sample

- Try [a live demo](https://credential-management-sample.appspot.com).
- Learn [how Credential Management API works](TBD).

## Installation

### Prerequisites
- Google App Engine
- Python 2.7
- pip
- virtualenv
- Node.js
- NPM
- Bower

### Step 1. Configure Google Sign-In
- Set up a new project at [Google Developers Console](https://console.cloud.google.com/)
- Create credentials
- Set "Authorized JavaScript origins" as your intended origin.
- Download `client_secret_****.json`, rename it to `client_secrets.json`
- Place `client_secrets.json` at root of this project

![](static/images/howto/gsi_config.png)

### Step 2. Install dependencies
- After cloning this repository, do the following:

```sh
# Create python virtualenv
$ virtualenv env
$ source env/bin/activate
# This command will install dependencies
$ npm install
```

### Step 3. Run the app
```sh
# Launch App Engine at root dir of this project with following command
$ dev_appserver.py working --host=0.0.0.0 --port=8080 --admin_port=8081
```
