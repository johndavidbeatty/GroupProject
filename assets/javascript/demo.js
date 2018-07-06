$(document).ready(function()
{
var saveit = "";
var yelpsave = "";

var url = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&lat=32.853431&lng=-117.182872&filters=category:food-and-drink&offset=0&limit=50"

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

        for (var i = 0; i < response.deals.length; i++)
        {
            if (response.deals[i].id == "opera-patisserie")
            {
                console.log("found it");
                saveit = response.deals[i];
                break;
            }
        }
    // ****
    // Now find the yelp data
    var term="name=opera"
    var zip ="92121"
    var url = 'https://api.yelp.com/v3/businesses/search?'+term+'&location='+zip
    
    $.ajaxPrefilter(function(options) {
        if (options.crossDomain && $.support.cors) {
            options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
        }
    });
    
    $.ajax(url, { headers: { Authorization: 'Bearer IOnOmcVyQA7g8bfItyRwB1JFyfXeJh0kXRqdwyKUjuxOP2LmvLLth68IN84LwKiAUSgtQN5Bikqdnm70id-_Sj_0U5vTewXNl7ycBkUayA45WB-ozhQ2VEq7-6AuW3Yx' }})
        .then(function(response)
        {
            console.log("Yelp response", response);
            console.log("Yelp array", response.businesses.length);

            for (var i = 0; i < response.businesses.length; i++)
        {
            if (response.businesses[i].name == "Opera Cafe & Patisserie")
            {
                console.log("yelp found it");
                yelpsave = response.businesses[i];
                break;
            }
        }
        
        // Now we have both groupon and yelp data
        console.log(saveit);
        console.log(yelpsave);
        var divIt = $("<div>")
        var xxDiv = $("<h3>").text("Name: " + yelpsave.name); 

        console.log("Name", yelpsave.name);
        divIt.append(xxDiv); 
        xxDiv = $("<p>Rating: " + yelpsave.rating + "</p>");
        divIt.append(xxDiv);
        xxDiv = $("<p>Price: " + yelpsave.price + "</p>");
        divIt.append(xxDiv);
        xxDiv = $("<p>Reviews: " + yelpsave.review_count + "</p>");
        divIt.append(xxDiv);
        xxDiv = $("<p>Deal: " + saveit.title + "</p>");
        divIt.append(xxDiv);
        console.log("dealURL", saveit.dealUrl);
        xxDiv = $("<p>URL = " + saveit.dealUrl + "</p></div>");
        divIt.append(xxDiv);

        $("#resultsDiv").append(divIt);

        });

    });
    


function showit()
{
    console.log("showing it", saveit);
}
});