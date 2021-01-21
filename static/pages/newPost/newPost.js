"use strict";

$(document).ready(function(){
    let _btnPublish=$("#btnPublish");
    $("#video-preview").hover( hoverVideo, hideVideo );

    _btnPublish.on("click",function(){
        alert("hello boya");
    })
})

function hoverVideo(e) {  
  $(this).get(0).play(); 
}

function hideVideo(e) {
  $(this).get(0).pause();
}

function showPreview(event){
  var src = URL.createObjectURL(event.target.files[0]);
  if(event.target.files.length > 0){
    var mimeType=event.target.files[0]['type'];
    if(mimeType.split('/')[0] === 'image'){
      document.getElementById("image-preview").style.display = "block";
      document.getElementById("image-preview").src = src;
      document.getElementById("video-preview").style.display = "none";
    }

    if(mimeType.split('/')[0] === 'video'){
      document.getElementById("image-preview").style.display = "none";
      document.getElementById("video-preview").style.display = "block";
      document.getElementById("video-preview").src = src;
    }
  }
}
