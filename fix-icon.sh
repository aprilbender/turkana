#!/bin/sh


cd "/Users/april/Documents/Bob-Museum Work/CO Site/CO Webflow Assets/SVG Exports/.git/refs" && find . -name "Icon?" -exec rm {} \;
cd "/Users/april/Documents/Bob-Museum Work/Siwalik Site/Siwalik Webflow Assets/Git/.git/refs" && find . -name "Icon?" -exec rm {} \;
cd "/Users/april/Documents/Bob-Museum Work/Turkana Site/Turkana Webflow Assets/git/.git/refs" && find . -name "Icon?" -exec rm {} \;
echo "Updated refs so they aren't as dumb now. Complete."