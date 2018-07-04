// This version formats output for http link on deal.  
// Deals show up, but don't match the company data

$(document).ready(function () {
    var saveit = [];
    var Street = "";
    var City = "";
    var Name = "";
    var State = "";
    var numToPull = 5;
    var yelp_cnt = 0;
    var grpOffset = 0;
    var processing = 0;

    // Clear this out if they need to pull multiple
    yelp_cnt = 0;

    $.ajaxPrefilter(function (options) {
        if (options.crossDomain && $.support.cors) {
            options.url = 'https://ucsdcodingcampgp1.herokuapp.com/' + options.url;
        }
    });

    /*
    for (var i = 0; i < numToPull; i++)  // Number of deals to pull
    {
        console.log("offset = ", grpOffset);
    }
    */

    startTheShow();

    function startTheShow()
    {
        console.log("startTheShow: Entering");
        console.log("startTheShow: NumToPull = ", numToPull, "processing = ", processing);

        var displayObject =
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
            deal: "",
            dealUrl: ""
        }

        // Kick off the search
        groupOnSearch(displayObject, processMultiple);
    }

    // This processes multiple entries
    function processMultiple (displayObject)
    {
        console.log("processMultiple: Processing = ", processing);
        // Check if more to process
        if (processing < numToPull)
        {
            // Increase the offset and kickstart the next one
            groupOnSearch(displayObject, processMultiple);
            grpOffset++;
            processing++;
        }

    }

    function groupOnSearch(data)
    {
        var url = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&lat=32.853431&lng=-117.182872&filters=category:food-and-drink&limit=1&offset=" + grpOffset;

        grpOffset++;

        $.ajax(url)
        .then(function (response) 
        {
            console.log("groupOnSearch: response", response);
            console.log("groupOnSearch: deal array", response.deals.length);

            // Stuff the respoonse
            saveit = response.deals[0];
            console.log("groupOnSearch: saveit ", saveit);

            var Name = saveit.merchant.name;
            var Street = saveit.options[0].redemptionLocations[0].streetAddress1;
            var City = saveit.options[0].redemptionLocations[0].city;
            var State = saveit.options[0].redemptionLocations[0].state;

            console.log("groupOnSearch: Groupon data - Name ", Name);
            console.log("groupOnSearch: Groupon data - Street ", Street);
            console.log("groupOnSearch: Groupon data - City ", City);
            console.log("groupOnSearch: Groupon data - State ", State);
            console.log("groupOnSearch: Groupon deal -  ", saveit.title);
            console.log("groupOnSearch: Groupon Deal URL ", saveit.dealUrl);

            // Save groupon data
            data.name = Name;
            data.streetAddress = Street;
            data.city = City;
            data.state = State;
            data.deal = saveit.title;
            data.dealUrl = saveit.dealUrl;
            console.log("groupOnSearch: data object ", data);

            // Now get the yelp ID
            getYelpID(data);
        });
    }

    function getYelpID(data)
    {
        Name = encodeURIComponent(data.name.trim());
        Street = encodeURIComponent(data.streetAddress.trim());
        City = data.city;
        State = data.state;

        var term = "name=" + Name;
        var url = 'https://api.yelp.com/v3/businesses/matches?' + term + '&address1=' + Street + '&city=' + City + '&state=' + State + '&country=US'
        console.log("getYelpID: URL: ", url)

        // $.ajax(url, { headers: { Authorization: 'Bearer IOnOmcVyQA7g8bfItyRwB1JFyfXeJh0kXRqdwyKUjuxOP2LmvLLth68IN84LwKiAUSgtQN5Bikqdnm70id-_Sj_0U5vTewXNl7ycBkUayA45WB-ozhQ2VEq7-6AuW3Yx' }})
        $.ajax(url, { headers: { Authorization: 'Bearer s8fyDTIEAcaKIhVHE-YXji0_G6gyCKWLxbwwL5Hg1PQW-Eu_ErKZ-xeV0_xRqQ0VtEV7XpS540SpNB9q4aQkcW-fp43IhgOgfh0fHP_d8YdNVHCqqxgMCBDQ8_U6W3Yx' } })
            .then(function (response) {
                console.log("getYelpID: Yelp response", response);
                console.log("getYelpID: Yelp array", response.businesses.length);
                data.yelpID = response.businesses[0].id;
                console.log("getYelpID: Yelp ID: ", data.yelpID);

                // Got the yelp ID, now get the yelp rich data
                getYelpData(data, processMultiple);
        });
    }

    function getYelpData(displayObject, callback)
    {
        // Now get the Yelp data we want from the ID
        url = 'https://api.yelp.com/v3/businesses/' + displayObject.yelpID;
        // $.ajax(url, { headers: { Authorization: 'Bearer IOnOmcVyQA7g8bfItyRwB1JFyfXeJh0kXRqdwyKUjuxOP2LmvLLth68IN84LwKiAUSgtQN5Bikqdnm70id-_Sj_0U5vTewXNl7ycBkUayA45WB-ozhQ2VEq7-6AuW3Yx' }})
        $.ajax(url, { headers: { Authorization: 'Bearer s8fyDTIEAcaKIhVHE-YXji0_G6gyCKWLxbwwL5Hg1PQW-Eu_ErKZ-xeV0_xRqQ0VtEV7XpS540SpNB9q4aQkcW-fp43IhgOgfh0fHP_d8YdNVHCqqxgMCBDQ8_U6W3Yx' } })
            .then(function (response) {
                console.log("GetYelpData: Yelp ID search response ", response);

                // Ok, at this point we have all the data we need
                console.log("getYelpData: Name ", response.name);

                displayObject.name = response.name;
                displayObject.streetAddress = response.location.address1;
                displayObject.rating = response.rating;
                displayObject.price = response.price;
                displayObject.open = response.hours[0].is_open_now;
                displayObject.review_count = response.review_count;

                console.log("getYelpData: DisplayObject ", displayObject);

                // Here's where we need to call showit
                showit(displayObject);
                callback(displayObject);
        }); 
    
    }

}); // On document ready

function showit (displayObject) {
    console.log("showing it");

    var divIt = "<a href='" + displayObject.dealUrl + "' target='_blank'>" + displayObject.deal + "</a>";

    console.log("DivIt = ", divIt);


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