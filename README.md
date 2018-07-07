# GroupProject
Group Project 1
Senyan Luo	
John Beatty		
Annette Beatty	


Our project combines the Yelp, Groupon and zipcode APIs to allow an end-user to be able to identify food discounts in their area along with yelp ratings, avg cost and a map link through google's map API (but since we're just giving the EU a google map link, we don't count that one.)

The time to grab the groupon discounts and then the associated yelp information could be a little long so we also developed a version that uses a firebase cache to prepopulate the yelp info around the groupon discount codes and then grab the yelp info based upon a groupon pull.


The front-end uses high-resolution graphics and bootstrap for a full desktop experience.

Per Joey’s suggestion, we used cors-anywhere to work around current browser single-origin security rules.

We've also added a version that cache's hits in a firebase DB.  This isn't our primary because it does require pre-populating the cache which is currently a manual process.
Design_fast.html, checks for the cache and then, in the event of a miss, grabs the data through yelp.
Our backlog is to make a node.js version of the pre-population app.

the stuff.html app is the tool to pre-populate data.



