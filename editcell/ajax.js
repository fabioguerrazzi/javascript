

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

function DoAjaxMethod(method, data, pid) {

 var st = ' This is the object that is going to be sent to ajax. On server side just create your sql statement easily in order to seek the record and update it \r\r';
    st += ' data.dati.Action = ' + data.dati.Action + '\r';
	st += ' data.dati.Table = ' + data.dati.Table + '\r';
	st += ' data.dati.Field = ' + data.dati.Field + '\r';
	st += ' data.dati.FieldType = ' + data.dati.FieldType + '\r';
	st += ' data.dati.FieldKey = ' + data.dati.FieldKey + '\r';
	st += ' data.dati.FieldKeyType = ' + data.dati.FieldKeyType + '\r';
	st += ' data.dati.Value = ' + data.dati.Value + '\r';
    st += ' data.dati.OldValue = ' + data.dati.OldValue + '\r';
	st += ' data.dati.RkID = ' + data.dati.RkID + '\r';
	st += ' data.dati.TagID = ' + data.dati.TagID + '\r';
	st += ' data.dati.RowNum = ' + data.dati.RowNum + '\r';
	st += ' data.dati.ColNum = ' + data.dati.ColNum + '\r';
	 
	
	
	$('#result').text(st);
	 //alert(st);
	return;
   /* data.dati.Table = CellData.table;
    data.dati.Field = CellData.field;
    data.dati.FieldType = CellData.type;
    data.dati.FieldKey = CellData.fieldkey;
    data.dati.FieldKeyType = CellData.fieldkeytype;
    data.dati.Value = CellData.newvalue;
    data.dati.OldValue = CellData.value;
    data.dati.RkID = id;
    data.dati.TagID = CellData.id;
    data.dati.RowNum = CellData.row;
    data.dati.ColNum = CellData.idx;
*/

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
        data: JSON.stringify(data),
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