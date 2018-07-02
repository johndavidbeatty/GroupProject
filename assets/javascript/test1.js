$(document).ready(function()
{
    var saveit = [];
    var yelpsave = "";
    var grouponArray = "";
    var yelpIDArray = [];
    var yelpDataArray = [];
    var Street = "";
    var City = "";
    var Name = "";
    var State = "";
    var groupon_limit = 10;
    var display_cnt = 0;
    var displayObject = 
    {
        name: "",
        streetAddress: "",
        rating: 0,
        price: "",
        open: true,
        review_count: 0,
        deal: "",
        dealUrl: ""    
    }

    var url = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&lat=32.853431&lng=-117.182872&filters=category:food-and-drink&offset=0&limit="+groupon_limit

    $.ajaxPrefilter(function(options) {
        if (options.crossDomain && $.support.cors) {
            options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
        }
    });

    $.ajax(url)
        .then(function(response)
        {
            console.log(response);
            console.log("deal array", response.deals.length);

            // All groupon deals are here now
            grouponArray = response.deals;

            // Need to fetch Yelp data now for each Groupon 
            // Pull yelp data for each Groupon Deal
            for (var i = 0; i < response.deals.length; i++)
            {
                saveit = response.deals[i]; 

                Name = saveit.merchant.name;
                Street = saveit.options[0].redemptionLocations[0].streetAddress1;
                City = saveit.options[0].redemptionLocations[0].city;
                State = saveit.options[0].redemptionLocations[0].state;

                console.log("Groupon data - Name ", Name); 
                console.log("Groupon data - Street ", Street);
                console.log("Groupon data - City ", City);
                console.log("Groupon data - State ", State);
                console.log("Groupon deal -  ", saveit.title);
                console.log("Groupon Deal URL ", saveit.dealUrl);
                

                Name = encodeURIComponent(Name.trim());
                Street = encodeURIComponent(Street.trim())

                var term="name=" + Name;
                var url = 'https://api.yelp.com/v3/businesses/matches?'+term+'&address1='+Street+'&city='+City+'&state='+State+'&country=US'
                console.log("URL: ", url)

                $.ajax(url, { headers: { Authorization: 'Bearer IOnOmcVyQA7g8bfItyRwB1JFyfXeJh0kXRqdwyKUjuxOP2LmvLLth68IN84LwKiAUSgtQN5Bikqdnm70id-_Sj_0U5vTewXNl7ycBkUayA45WB-ozhQ2VEq7-6AuW3Yx' }})
                .then(function(response)
                {
                    console.log("Yelp response", response);
                    console.log("Yelp array", response.businesses.length);
                    yelpIDArray[i] = response.businesses[0].id;
                    console.log("Yelp ID: ", yelpIDArray[i]);

                    // Now get the Yelp data we want from the ID
                    url = 'https://api.yelp.com/v3/businesses/'+yelpIDArray[i]
                    $.ajax(url, { headers: { Authorization: 'Bearer IOnOmcVyQA7g8bfItyRwB1JFyfXeJh0kXRqdwyKUjuxOP2LmvLLth68IN84LwKiAUSgtQN5Bikqdnm70id-_Sj_0U5vTewXNl7ycBkUayA45WB-ozhQ2VEq7-6AuW3Yx' }})
                    .then(function(response)
                    {
                        console.log("Yelp ID search response ", response);
                        yelpDataArray[i] = response;

                        // Ok, at this point we have all the data we need
                        // saveit - has Groupon data, yelpDataArray - has Yelp data
                        // Make an array of just what we want
                        console.log("Name ", response.name);
                        /*
                        console.log("title ", saveit[i].title);
                        console.log("DealURL ", saveit[i].dealUrl); */

                        displayObject.name = response.name;
                        displayObject.streetAddress = response.location.address1;
                        displayObject.rating = response.rating;
                        displayObject.price = response.price;
                        displayObject.open = response.hours[0].is_open_now;
                        displayObject.review_count = response.review_count;
                        displayObject.deal = saveit.title;
                        displayObject.dealUrl = saveit.dealUrl;

                        console.log("DisplayObject ", displayObject);

                        // Here's where we need to call showit
                        showit();
                    });
                });
            }
        });

    function showit()
    {
        console.log("showing it");

        var divIt = $("<div>")
        var xxDiv = $("<h3>").text("Name: " + displayObject.name); 

        /*
        divIt.append(xxDiv); 
        xxDiv = $("<p>Rating: " + displayObject.rating + "</p>");
        divIt.append(xxDiv);
        xxDiv = $("<p>Street: " + displayObject.streetAddress + "</p>");
        divIt.append(xxDiv);
        xxDiv = $("<p>Open: " + displayObject.open + "</p>");
        divIt.append(xxDiv);
        xxDiv = $("<p>Price: " + displayObject.price + "</p>");
        divIt.append(xxDiv);
        xxDiv = $("<p>Reviews: " + displayObject.review_count + "</p>");
        divIt.append(xxDiv);
        xxDiv = $("<p>Deal: " + displayObject.deal + "</p>");
        divIt.append(xxDiv);
        xxDiv = $("<p>URL = " + displayObject.dealUrl + "</p></div>");
        divIt.append(xxDiv);
        */

        $("#restable").append(`
        <tr><td>${displayObject.name}</td>
        <td>${displayObject.streetAddress}</td>
        <td>${displayObject.rating}</td>
        <td>${displayObject.price}</td>
        <td>${displayObject.open}</td>
        <td>${displayObject.review_count}</td>
        <td>${displayObject.deal}</td></tr>`);
    }


});