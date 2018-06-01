

/*

 This JS contains some helper functions used in the plugin
 
*/
function isnull(tag) { return isNull(tag); }
function Isnull(tag) { return isNull(tag); }
function IsNull(tag) { return isNull(tag); }

function isNull(tag) {
    return (tag == undefined || tag === "" || tag === "undefined" || tag === "NaN" || tag === "NAN" || tag === "nan");
}


function DoAjax(method, div, pid) {

    /*

    method: azione che controllerai come querystring dentro la Load di ajax.aspx.cs
    pid: id della chiamata ajax. Questo serve se vuoi eseguire qualcosa dopo che la call ha concluso il thread.

    */


    console.log("metodo: " + method + " div: " + div + " pid: " + pid);
    $.ajax({
        url: '../ajax.aspx?q=' + method, success: function (result) {
          //  alert(result);
            $('#' + div).html(result); // scrive il risultato async sulla pagina
            postAjax(pid);
        },
        failure: function (result) {
            showmessage('err', "errore chiamata ajax: " + result);
        }
    });

     
}

function DoAjaxMethod(method, parms, pid) {


    /*
    method: la funzione in ajax (es: DeleteRecord), non restituisce risultati

    parms (dichiarali cosi)
       var parms = {};
           parms.id = key;
           parms.entity = cosa;

    il WebMethod dentro ajax.aspx.cs avra come parametri
      string DeleteRecord(string id, string entity)
      {
           ..
        return "OK"; // informa il js chiamante che ha completato la funzione
      }


    pid: id della chiamata ajax. Questo serve se vuoi eseguire qualcosa dopo che la call ha concluso il thread.

    */

    //alert(method);
   
    $.ajax({
        
        url: '../ajax.aspx/' + method,
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(parms),
        success: function (response) {
            if (response.d !== "OK") showmessage('err', "err: " + response.d);
            postAjax(pid);
        },
        failure: function (response) {
            showmessage('err', "err: " + response.d);
        }

    });

}

function postAjax(pid)
{
    console.log("eseguito postAjax in CustomLIMS.js con pid numero " + pid);

    // usa un id specifico per ogni chiamata ajax a seconda delle azioni che vuoi che esegua dopo la call
    // benche ajax sia asincrono quesi li esegue quando ha finito e renderizzato il risultato, se ci sta un ora a completare il processo, qui ci passa dopo un ora

    if (pid == 1)
    {
        // di esempio, se passato pid = 1 dopo la call ajax esegue questo codice
        showmessage('info', "chiamata Ajax eseguita correttamente. questo messaggio è visualizzato dopo che la chiamata ajax è stata processata completamente");
   
    }

     

    pid = 0; // reset pid
}