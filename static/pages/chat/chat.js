"use strict";

$(document).ready(function() {
    let chats=$("body");

    chatCell();
    chatCell();
    chatCell();
    chatCell();
    chatCell();
    chatCell();
    chatCell();
    chatCell();
    chatCell();
    chatCell();
    chatCell();
    chatCell();
    chatCell();

    function chatCell(){
        let _chat=$("<div>").attr("class","chat");
        let _chatcell=$("<div>").attr("class","chatcell");
        let _textcell=$("<div>").attr("class","textcell");
        let _propic=$("<img>").attr({"class":"rounded-circle float-left propic","src":"../../img/account.png"});
        let _message=$("<div>").attr("class","message");
        let _username=$("<a>").attr({"class":"username","href":"#"}).html("username");

        
        _username.appendTo(_textcell);
        _message.appendTo(_textcell).html("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
        _propic.appendTo(_chatcell);
        _textcell.appendTo(_chatcell);
        _chatcell.appendTo(_chat);
        _chat.appendTo(chats);
    }
});