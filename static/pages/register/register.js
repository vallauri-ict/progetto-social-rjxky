"use strict";

$(document).ready(function () {
    let propicInput = $("#propicInput");
    let imagepreview = $("#image-preview");
    let usernameInput = $("#usernameInput");
    let nomeInput = $("#nomeInput");
    let cognomeInput = $("#cognomeInput");
    let dobInput = $("#dobInput");
    let sessoInput = $("#sessoInput");
    let dobInput = $("#dobInput");
    let emailInput = $("#emailInput");
    let passwordInput = $("#passwordInput");
    let numTelInput = $("#numTelInput");
    let _email = emailInput.val();
    let _password = passwordInput.val();
    let btnRegister = $("#btnRegister").on("click", controllaRegistrazione);

    $("#file-ip-1").on("change",function(){
        var src = URL.createObjectURL(this.files[0]);
        if(this.files.length > 0){
            document.getElementById("image-preview").style.display = "block";
            document.getElementById("image-preview").src = src;
        }
    });

    function controllaRegistrazione(){
        if (propicInput.val()=="")
            openSnackbar("Inserire l'immagine profilo!"); 
		else {
			let request = inviaRichiesta("POST", "/login", 
				{ "Propic": propicInput.attr("src"),
                  "Username": usernameInput.val(),
                  "Nome": nomeInput.val(),
                  "Cognome": cognomeInput.val(),
                  "DoB": dobInput.val(),
                  "Sesso": sessoInput.val(),
                  "Email": _email,
                  "Password": _password,
                  "NumTel":numTelInput.val()
				}
			);
			request.fail(function(jqXHR, test_status, str_error) {
				if (jqXHR.status == 401) {  // unauthorized
					_lblErrore.show();
				} else
					errore(jqXHR, test_status, str_error);
			});
			request.done(function(data) {
				window.location.href = "../../index.html";
			});	
        }
    }
});
  /* ********************* u can't touch this ************************ */

  function inviaRichiesta(method, url, parameters = {}) {
    let contentType;
    if (method.toUpperCase() == "GET")
    {
        contentType = "application/x-www-form-urlencoded; charset=UTF-8"
    }
    else
    {
        contentType = "application/json; charset=UTF-8"
        parameters = JSON.stringify(parameters);
    }

    return $.ajax({
        url: url, //default: currentPage
        type: method,
        data: parameters,
        contentType: contentType,
        dataType: "json",
        timeout: 5000
    });
}


function errore(jqXHR, testStatus, strError) {
    if (jqXHR.status == 0)
    {
        swal("Error!", "Connection refused or Server timeout", "error");
    }
    else if(jqXHR.status == 403)
    {
        window.location.href="../../index.html";
    }
    else if (jqXHR.status == 200)
    {
        swal("Error!", "Data format uncorrect: " + jqXHR.responseText, "error");
    }
    else
    {
        swal("Error!", "Server Error: " + jqXHR.status + " - " + jqXHR.responseText, "error");
    }
}

