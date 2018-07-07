// Incorporating John's zip logic and resets after showing results
var database = firebase.database();
$(document).ready(function () {
  
    
    var saveit = [];
    var numToPull = 250; // Number of deals we'll show.  If all, we pull only 10
    var grponPull = 250; // Number we're pulling from Groupon
    var grpOffset = 0;
    var processing = 0;
    var grpnLocStr = "";
    var gresponse = {};
    var inProgress = false;
    var food = "";
    var testObj;

    

    // Set up the CORS server link
    $.ajaxPrefilter(function (options) {
        if (options.crossDomain && $.support.cors) {
            options.url = 'https://ucsdcodingcampgp1.herokuapp.com/' + options.url;
        }
    });

    //  User clicked on a food category
    //  on IP when no other location is entered.
    $(document).on("click", ".food", function() 
    {
        event.preventDefault();
        console.log("Food input: ");

        if (inProgress)
            return;

        var zip = $("#zipCode").val().trim();
        console.log("Food click: entered zip = ", zip);
        food = $(this).val();
        console.log("Food click: food = ", food);



        console.log("Food input: numToPull - ", numToPull);
        // If they entered a zipcode, find longitude and latitude to pass to groupon
        if (zip)
        {
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
            {   // **** Annette -- Need to put this error somewhere ****
                $("#city").text("Please enter a valid US zip code")
                startTheShow(grpnLocStr);
            };


        }
        else
        {   // Use IP to find location
            grpnLocStr = "";
            startTheShow(grpnLocStr);
        }

    });

    function resetAll ()
    {   
        grpOffset = 0;
        processing = 0;
        grpnLocStr = "";
        gresponse = {};
        $("#resultsDiv").empty();
    }

    function startTheShow(grpnLocStr)
    {
        console.log("startTheShow: Entering");
        console.log("startTheShow: NumToPull = ", numToPull, "processing = ", processing);

        resetAll();

        $("#working").html("<div style='width:image width px; font-size:80%; text-align:center;'><img src='images/hamburger3.gif' alt='working' width='75px' height='75px' style='padding-bottom:0.0em;' /><h7>  Searching for your best deals...</h7></div><br>");

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
        console.log("processMultiple: numToPull = ", numToPull);
        console.log("processMultiple: Groupon Array length", grpOnArray.length);
        
        // Check if more to process
        if (processing < numToPull && processing < grpOnArray.length)
        {
            // Call the yelpID now with the Groupon data
            getYelpID(grpOnArray, processMultiple);

        }
        else  
        {
            inProgress = false;
            $("#working").empty();
        }

    }

    // This function goes out to Groupon and grabs deals
    function groupOnSearch(grpnLocStr, groupOnComplete)
    {
        var url = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0" + grpnLocStr + "&filters=category:food-and-drink&limit=" + grponPull + "&offset=" + grpOffset+"&radius=100";

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
                    dealUrl: "",
                    yelpUrl: "",
                    dealID: ""
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
                data.dealID = saveit.uuid;

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

        $.ajax(url, { headers: { Authorization: 'Bearer IOnOmcVyQA7g8bfItyRwB1JFyfXeJh0kXRqdwyKUjuxOP2LmvLLth68IN84LwKiAUSgtQN5Bikqdnm70id-_Sj_0U5vTewXNl7ycBkUayA45WB-ozhQ2VEq7-6AuW3Yx' }})
        // $.ajax(url, { headers: { Authorization: 'Bearer s8fyDTIEAcaKIhVHE-YXji0_G6gyCKWLxbwwL5Hg1PQW-Eu_ErKZ-xeV0_xRqQ0VtEV7XpS540SpNB9q4aQkcW-fp43IhgOgfh0fHP_d8YdNVHCqqxgMCBDQ8_U6W3Yx' } })
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
        $.ajax(url, { headers: { Authorization: 'Bearer IOnOmcVyQA7g8bfItyRwB1JFyfXeJh0kXRqdwyKUjuxOP2LmvLLth68IN84LwKiAUSgtQN5Bikqdnm70id-_Sj_0U5vTewXNl7ycBkUayA45WB-ozhQ2VEq7-6AuW3Yx' }})
        // $.ajax(url, { headers: { Authorization: 'Bearer s8fyDTIEAcaKIhVHE-YXji0_G6gyCKWLxbwwL5Hg1PQW-Eu_ErKZ-xeV0_xRqQ0VtEV7XpS540SpNB9q4aQkcW-fp43IhgOgfh0fHP_d8YdNVHCqqxgMCBDQ8_U6W3Yx' } })
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
                data.yelpUrl = response.url;
                
                console.log("getYelpData: DisplayObject ", data);

                // Here's where we need to call showit
                // If it's the right food category, show it otherwise move on
                console.log("getYelpData: categories", data.categories, "food = ", food);

                if (food == "all")
                {
                    showit(data);
                }
                else
                {
                    for (var i = 0; i < data.categories.length; i++)
                    {
                        console.log("getYelpData: category = ", data.categories[i].alias);

                        if (data.categories[i].alias == food || (food == "japanese" && data.categories[i].alias == "sushi"))
                        {
                            showit(data);
                            break
                        }
    
                    }
                }

                processing++;  // Move to next array element
                callback(grpOnArray);
        }); 
    
    }

}); // On document ready

function showit (displayObject) {

    // clean up output for if business is open or closed

    if (displayObject.open){
        var status="now open"
    } else if (!displayObject.open){
        var status="closed"
    }else {
        var status="   " 
    };

    // develop number of review stars to show

    if (displayObject.rating < .8) {revImg="./images/0.png"} 
    else if (displayObject.rating < 1.25 ) {revImg="./images/1.png"} 
    else if (displayObject.rating < 1.8 ) {revImg="./images/15.png"}
    else if (displayObject.rating < 2.25 ) {revImg="./images/2.png"}
    else if (displayObject.rating < 2.8 ) {revImg="./images/25.png"}
    else if (displayObject.rating < 3.25 ) {revImg="./images/3.png"}
    else if (displayObject.rating < 3.8 ) {revImg="./images/35.png"}
    else if (displayObject.rating < 4.25 ) {revImg="./images/4.png"}
    else if (displayObject.rating < 4.8 ) {revImg="./images/45.png"}
    else if (displayObject.rating <= 5 ) {revImg="./images/5.png"}
    else  {revImg="./images/unknown.png"}


    // clean up output for when there is no price defined.

    if (typeof displayObject.price==="undefined") {
        displayObject.price="?"
    };

    // create clickable link for deal with deal details

    var divIt = "<a href='" + displayObject.dealUrl + "' target='_blank'>" + displayObject.deal + "</a>";

    // create map link using address

    var googMap= "https://www.google.com/maps/search/?api=1&query="+(encodeURIComponent(displayObject.streetAddress+"+"+displayObject.city+"+"+displayObject.state));
    var mapIt = "<a href='" + googMap + "' target='_blank'><img src=./images/map.png title='open map' alt='map'></a>";

    // write values out to Div in a bootstrap table.

    $("#resultsDiv").append(`<tr><td><h8>${displayObject.name}</h8>  
    <a href='${displayObject.yelpUrl}' target='_blank'><img src=${revImg} title="Avg. review, click to go to Yelp page">
    <h9 title="number of reviews">(${displayObject.review_count})</h9><img src=./images/dollar.png title="cost:" alt="cost:">
    <h10 title="cost">       ${displayObject.price}</h10>
    <h11 title="if business is open now">   ${status}<h/11>
    <h12 title="open Google Map of location">    ${mapIt}</h12><br>
    ${divIt} </td></tr>`)
    // stuffIt(displayObject)
    stuffIt(displayObject);
};

function stuffIt (displayObject) {
    database.ref("/"+displayObject.dealID+"/").set(displayObject);

};

function cached(searchString) {

    database.ref("/"+searchString+"/").once("value" , function (snapshot) {


        testObj = snapshot.val();
        console.log("testObj: ", testObj);
      
      }, function (errorObject) {
        console.log("Error: " + errorObject.code);
      });
}


