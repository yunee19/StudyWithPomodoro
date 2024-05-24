diary = {
    log: function(msg)
    {
        if (window.console) {
            console.log(msg);
        }
    },

    showEntries: function() {
        var data = localStorage.getItem("data");
        if (!data) {
            data = [
                "<h3>Welcome to My Diary!!</h3>"              +
                "<div class='date'>Tue Mar 17 01:05 2012</div>" +
                "<p>There are currently no entries in this diary, but go ahead and add one — it will be AWESOME!!!</p>"
            ];
        }
        else {
            data = JSON.parse(data);
        }
        var $posts = $("#posts");
        $posts.empty();
        $.each(data, function (i, post) {
            $posts.append($("<div class='post'></div>").append($(post)));
        });
    },

    addEntry: function(subject, body) {
        var data = localStorage.getItem("data");
        if (data) data = JSON.parse(data);
        else data = [];
        body = body.replace(/\n/g, "<br/>");
        var $cont = $("<div></div>");
        $("<h3></h3>").text(subject).appendTo($cont);
        $("<div class='date'></div>").text((new Date).toLocaleString()).appendTo($cont);
        $("<p></p>").html(body).appendTo($cont);
        data.unshift($cont.html()); // the new entry is the first element in the array.
        localStorage.setItem("data", JSON.stringify(data));
    },

    addTxt: function () {
        $("#add-text").show().find("input").focus();
    },

    okEdit: function () {
        var subject = $("#add-text input").val();
        if (!subject) {
            alert("Subject is required");
            return;
        }
        var body = $("#add-text textarea").val();
        if (!body) {
            alert("Body is required");
            return;
        }
        diary.addEntry(subject, body);
        diary.getLoc();
        diary.cancelEdit();
    },

    cancelEdit: function () {
        $("#add-text input").val("");
        $("#add-text textarea").val("");
        $("#add-text").hide();
    },

    getLoc: function() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(diary.getAddress, diary.handleGeoError, {
                enableHighAccuracy: true,
                maximumAge: 1000, //1 second
                timeout: 300000 //5 minutes
            });
        } else {
            diary.showEntries();
        }
    },

    //get the address given lat and lng, and use google map api for reverse geocoder to get the location
    getAddress: function(position) {
        diary.log ("Latitude = " + position.coords.latitude);
        diary.log ("Longitude = " + position.coords.longitude);
        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    diary.log("location got is : " + results[0].formatted_address);
                    var data = localStorage.getItem("data");
                    if (data) {
                        data = JSON.parse(data);
                        //update the location of the first array element, then save to local storage
                        data.splice(0, 1, data[0] + ("<div class='loc'>" + results[0].formatted_address + "</div>"));
                        //console.dir(data);
                        localStorage.setItem("data", JSON.stringify(data));
                    }
                } else {
                    diary.log("No address found!");
                }
            } else {
                diary.log("Geocoder failed due to: " + status);
            }
            diary.showEntries();
        });
    },

    handleGeoError: function(error)
    {
        diary.showEntries();
        switch(error.code)
        {
            case error.TIMEOUT:
                diary.log("Geolocation Timeout");
                break;
            case error.POSITION_UNAVAILABLE:
                diary.log("Geolocation Position unavailable");
                break;
            case error.PERMISSION_DENIED:
                diary.log("Geolocation Permission denied");
                break;
            default:
                diary.log("Geolocation returned an unknown error code: " + error.code);
        }
    }
}

$(document).ready(function() {
    diary.log("Starting the application.");
    diary.showEntries();
});
