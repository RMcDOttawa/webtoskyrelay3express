Originally, WebSkyDarks, an Angular application, was intended to be stand-alone, running entirely in the users' browser. No server, no privacy concerns - it seemed to good to be true.

It was.

An angular app, running in a browser, cannot open primitive TCP sockets.  It can open Web connections, WebSockets, and Socket.io, but not primite TCP such as Telnet.

And primitive TCP is what TheSkyX uses to communicate.  So the Angular app couldn't communicate with TheSkyX.

Hence this program.  It is a simple Node Express server that acts as a relay.  It communicates with Angular in the browser over an HTTP REST interface, then communicates with TheSkyX using a primitive TCP socket.

This program will need to be running somewhere in the users' network.  This isn't difficult, provided the user has node.js installed.