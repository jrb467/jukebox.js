# jukebox.js

A collaborative, group-music player

## Overview

Provides a central hub for playing music locally. Users upload a song to the server, and the server then plays that song on whatever machine it's running on.

Currently, any song added is queued automatically. There's no limitation on uploads (except they must point to some Soundcloud address).

## Setup

First and foremost all the necessary packages must be installed. This includes the CLI program ```mpg123``` and all the node and bower modules. Node modules are installed with ```npm install``` (note that ```npm``` and ```node``` must be installed prior) and bower components with ```bower install jquery```

NOTE: if using bower just for jquery doesn't strike your fancy, just modify ./client/index.html to change the jquery script import to the source of your choosing 

After that, two empty folders ('artwork' and 'uploads') both need to be created in the project root (these are assumed at runtime to exist).

Then you can run the server with ```gulp```. This will build the source and start the server. It should work, but I didn't test this outside of my own machine (Ubuntu-based).

Listens on port 3000. Connect to it through your browser (tested on chrome and nothing else, tell me if you see any bugs!)

## KNOWN BUGS

- The Soundcloud URL is parsed immediately when received into a valid audio stream, but it is not downloaded. As the Soundcloud resource URIs expire after about 10 minutes, this can cause the audio playback to fail if soundcloud sounds are added too early

- The song list doesn't do any auto scrolling yet
