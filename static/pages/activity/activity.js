"use strict";

$(document).ready(function() {
    let activities=$("body");

    activityCell();
    activityCell();
    activityCell();
    activityCell();
    activityCell();

    function activityCell(){
        let _activity=$("<div>").attr("class","activity");
        let _activitycell=$("<div>").attr("class","activitycell");
        let _propic=$("<img>").attr({"class":"rounded-circle float-left propic","src":"../../img/account.png"});
        let _text=$("<div>").attr("class","text");
        let _desc=$("<p>").attr("class","desc").html("ti ha menzionato in un post.");
        let _username=$("<a>").attr({"class":"username","href":"#"}).html("username");

        _propic.appendTo(_activitycell);
        _username.appendTo(_text);
        _desc.appendTo(_text);
        _text.appendTo(_activitycell);
        _activitycell.appendTo(_activity);
        _activity.appendTo(activities);
    }
});