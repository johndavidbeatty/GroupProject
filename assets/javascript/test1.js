// Incorporating John's zip logic and resets after showing results

$(document).ready(function () {
    var saveit = [];
    var numToPull = 10; // Number of deals we'll show
    var grponPull = 50; // Number we're pulling from Groupon
    var grpOffset = 0;
    var processing = 0;
    var grpnLocStr = "";
    var gresponse = {};
    var inProgress = false;

    // Set up the CORS server link
    $.ajaxPrefilter(function (options) {
        if (options.crossDomain && $.support.cors) {
            options.url = 'https://ucsdcodingcampgp1.herokuapp.com/' + options.url;
        }
    });

    // This button just uses standard Groupon query which uses current location based
    //  on IP when no other location is entered.

    $("#curLoc").on("click", function (event) 
    {
        event.preventDefault();

        if (inProgress)
            return;

        grpnLocStr="";
        startTheShow(grpnLocStr);
    });

    // This segment gets zipcode, and and then processes it into lat and long for Groupon 
    // (who doesn't take zip codes :( ))
    // First get the value in the button

    $("#getLoc").on("click", function (event) 
    {
        event.preventDefault();

        if (inProgress)
            return;
  
        var zip = $("#zipCode").val().trim();
        console.log("getLoc: entered zip: ", zip);
  
        //  make sure it is a valid zip code (or good enough)
        if ((parseInt(zip)) > 1000 && (parseInt(zip)) < 99951) 
        {
          var zurl = "https://www.zipcodeapi.com/rest/NnhKKXxjVlQfKghOtdW83dPHEUYPi8K41sMduv0tzFaf0M5GitUpmwyv1S3pA9xn/info.json/"+zip+"/degrees";
  
          $.ajax(zurl)
              .then(function (zipOut) 
              {
                  console.log("getLoc: GPS: ", zipOut);
                  grpnLocStr="&lat="+zipOut.lat+"&lng="+zipOut.lng;
                  console.log("getLoc: Groupon Location String: ", grpnLocStr);
                  console.log("getLoc: city name: ",zipOut.city);
                  $("#city").text(zipOut.city+", "+zipOut.state);
  
                  startTheShow(grpnLocStr);
              });
        } 
        else 
        {
          $("#city").text("Please enter a valid US zip code")
        };
    });

    function resetAll ()
    {   
        grpOffset = 0;
        processing = 0;
        grpnLocStr = "";
        gresponse = {};
        inProgress = false;
        $("#resultsDiv").empty();
    }

    function startTheShow(grpnLocStr)
    {
        console.log("startTheShow: Entering");
        console.log("startTheShow: NumToPull = ", numToPull, "processing = ", processing);

        resetAll();

        // Set the in progress flag so they can't do another selection until we're done
        inProgress = true;


        // Kick off the search
        groupOnSearch(grpnLocStr, groupOnComplete);
    }

    // Groupon Data is collected
    function groupOnComplete(grpOnArray)
    {
        console.log("groupOnComplete: grpOnArray = ", grpOnArray);
        
        // Kick off starting processing the Yelp data serially
        processMultiple(grpOnArray);
    }

    // This is the call back that processes multiple entries
    function processMultiple (grpOnArray)
    {
        console.log("processMultiple: Processing = ", processing);
        console.log("processMultiple: Object = ", grpOnArray[processing]);
        
        // Check if more to process
        if (processing < numToPull)
        {
            // Call the yelpID now with the Groupon data
            getYelpID(grpOnArray, processMultiple);

        }
        else  
        {
            inProgress = false;

        }

    }

    // This function goes out to Groupon and grabs deals
    function groupOnSearch(grpnLocStr,groupOnComplete)
    {
        var url = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0" + grpnLocStr + "&filters=category:food-and-drink&limit=" + grponPull + "&offset=" + grpOffset;

        $.ajax(url)
        .then(function (response) 
        {
            var grpOnArray = [];
            console.log("groupOnSearch: response", response);
            console.log("groupOnSearch: deal array size", response.deals.length);

            for (var i = 0; i < response.deals.length; i++)
            {
                var data =
                {
                    name: "",
                    streetAddress: "",
                    city: "",
                    state: "",
                    yelpID: "",
                    rating: 0,
                    price: "",
                    open: true,
                    review_count: 0,
                    categories: "",
                    deal: "",
                    dealUrl: ""
                }

                // Stuff the respoonse so we don't have to type the response.deals
                saveit = response.deals[i];
                console.log("groupOnSearch: saveit ", saveit);

                var Name = saveit.merchant.name;

                // Street, City and address are required, so if they don't have it,
                // we won't include this deal
                if (saveit.options[0].redemptionLocations[0] == null)
                    continue;

                if (saveit.options[0].redemptionLocations[0].streetAddress1 == null)
                    continue;
                else 
                    var Street = saveit.options[0].redemptionLocations[0].streetAddress1;
                
                if (saveit.options[0].redemptionLocations[0].city == null)
                    continue;
                else 
                    var City = saveit.options[0].redemptionLocations[0].city;
                
                if (saveit.options[0].redemptionLocations[0].state == null)
                    continue;
                else 
                    var State = saveit.options[0].redemptionLocations[0].state;

                // Debugging
                console.log("groupOnSearch: Groupon data - Name ", Name);
                console.log("groupOnSearch: Groupon data - Street ", Street);
                console.log("groupOnSearch: Groupon data - City ", City);
                console.log("groupOnSearch: Groupon data - State ", State);
                console.log("groupOnSearch: Groupon deal -  ", saveit.title);
                console.log("groupOnSearch: Groupon Deal URL ", saveit.dealUrl);

                // Save groupon data in the object
                data.name = Name;
                data.streetAddress = Street;
                data.city = City;
                data.state = State;
                data.deal = saveit.title;
                data.dealUrl = saveit.dealUrl;

                console.log("groupOnSearch: data object ", data);

                // Stuff this into an array we will use later
                grpOnArray.push(data);

                console.log("groupOnSearch: grpOnArray ", grpOnArray);
            }

            // Groupons all loaded in array.  Now need to start processing 
            groupOnComplete(grpOnArray);

        });
    }

    function getYelpID(grpOnArray)
    {
        var data = grpOnArray[processing];
        var Name = encodeURIComponent(data.name.trim());
        var Street = encodeURIComponent(data.streetAddress.trim());
        var City = encodeURIComponent(data.city.trim());
        var State = data.state;

        var term = "name=" + Name;
        var url = 'https://api.yelp.com/v3/businesses/matches?' + term + '&address1=' + Street + '&city=' + City + '&state=' + State + '&country=US'
        console.log("getYelpID: URL: ", url)

        // $.ajax(url, { headers: { Authorization: 'Bearer IOnOmcVyQA7g8bfItyRwB1JFyfXeJh0kXRqdwyKUjuxOP2LmvLLth68IN84LwKiAUSgtQN5Bikqdnm70id-_Sj_0U5vTewXNl7ycBkUayA45WB-ozhQ2VEq7-6AuW3Yx' }})
        $.ajax(url, { headers: { Authorization: 'Bearer s8fyDTIEAcaKIhVHE-YXji0_G6gyCKWLxbwwL5Hg1PQW-Eu_ErKZ-xeV0_xRqQ0VtEV7XpS540SpNB9q4aQkcW-fp43IhgOgfh0fHP_d8YdNVHCqqxgMCBDQ8_U6W3Yx' } })
            .then(function (response)
            {
                console.log("getYelpID: Yelp response", response);
                console.log("getYelpID: Yelp array", response.businesses.length);
                if (response.businesses.length > 0)
                {
                    data.yelpID = response.businesses[0].id;
                    console.log("getYelpID: Yelp ID: ", data.yelpID);
                    console.log("getYelpID: grpOnArray : ", data);

                    // Got the yelp ID, now get the yelp rich data
                    getYelpData(grpOnArray, processMultiple);
                }
                else
                {
                    console.log("getYelpID: Can't find this business - ", data.name);
                    // Take it out of the Groupon Array and process the next element
                    grpOnArray.splice (processing, 1);
                    processMultiple(grpOnArray);
                }
            },

            // Error processing here
            function()
            {
                console.log("getYelpID: Yelp returned error - ", data.name);

                // Take it out of the Groupon Array and process the next element
                grpOnArray.splice (processing, 1);
                processMultiple(grpOnArray);
            }
        );
    }

    function getYelpData(grpOnArray, callback)
    {
        var data = grpOnArray[processing];

        console.log("getYelpData: dataobject ", data);
        // Now get the Yelp data we want from the ID
        url = 'https://api.yelp.com/v3/businesses/' + data.yelpID;

        console.log("getYelpData: URL ", url);
        // $.ajax(url, { headers: { Authorization: 'Bearer IOnOmcVyQA7g8bfItyRwB1JFyfXeJh0kXRqdwyKUjuxOP2LmvLLth68IN84LwKiAUSgtQN5Bikqdnm70id-_Sj_0U5vTewXNl7ycBkUayA45WB-ozhQ2VEq7-6AuW3Yx' }})
        $.ajax(url, { headers: { Authorization: 'Bearer s8fyDTIEAcaKIhVHE-YXji0_G6gyCKWLxbwwL5Hg1PQW-Eu_ErKZ-xeV0_xRqQ0VtEV7XpS540SpNB9q4aQkcW-fp43IhgOgfh0fHP_d8YdNVHCqqxgMCBDQ8_U6W3Yx' } })
            .then(function (response) {
                console.log("GetYelpData: Yelp ID search response ", response);

                // Ok, at this point we have all the data we need
                console.log("getYelpData: Name ", response.name);

                data.name = response.name;
                data.streetAddress = response.location.address1;
                data.rating = response.rating;
                data.price = response.price;
                if (response.hours == null)
                    data.open = "N/A";
                else
                    data.open = response.hours[0].is_open_now;
                data.review_count = response.review_count;
                data.categories = response.categories;
                
                console.log("getYelpData: DisplayObject ", data);

                // Here's where we need to call showit
                showit(data);
                processing++;  // Move to next array element
                callback(grpOnArray);
        }); 
    
    }

}); // On document ready

function showit (displayObject) {
    console.log("showit:  Displaying data");

    var divIt = "<a href='" + displayObject.dealUrl + "' target='_blank'>" + displayObject.deal + "</a>";

    console.log("showit: DivIt = ", divIt);

    // *** need to work in here *** //

    $("#resultsDiv").append(`
    <tr><td>${displayObject.name}</td>
    <td>${displayObject.streetAddress}</td>
    <td>${displayObject.rating}</td>
    <td>${displayObject.price}</td>
    <td>${displayObject.open}</td>
    <td>${displayObject.review_count}</td>
    <td>${divIt}</td></tr>`);
}