Email API

This NodeJS API connects sends emails from Tapis authentication users.


# INSTALLATION
To run the nodejs server after pulling the repository:

1. npm install
2. edit the config.js
3. run the server with >node server.js

OR you can build the docker container and run that:

1. edit the config.js - make sure the port is 8080 as this is what is exposed in the dockerfile
2. run >docker build -t email__api .
3. run >docker run -d -p 8080:8080 agave_chords_api

The container can be accessed on localhost:8080 now.

