/*

Extra Editable Teble Cell - Fabio Guerrazzi per Extra.Cube - Handler per il LiveEdit di un oggetto Table
v 1.0 20/04/2018 - input cell live update
v 1.1 25/05/2018 - Aggiunto DropDown
v 1.2 31/05/2018 - added data-row on <tr> to handle multiline
v 1.3 01/06/2018 - added checkbox  


NON EDITARE Extra-EditableCells.js per operazioni case/switch specifiche, questo js deve rimanere astratto
tutte le operazioni specifiche locali falle in ApplyLocalChanges che deve risiedere nella tua pagina dove renderizzi la grid

 Includi questo js nella pagina dove vuoi che il table diventi editable e una volta impostate tutte le caratteristiche necessarie
 per attivarlo chiama

 requisiti di esempio: (tra due % sono intesi i dati variabili)

  <div id="myDropDown" class="hidden">
        <select id="sel-01" data-selector="mySel" class="input-sm form-control input-s-sm inline">
            <option class="myItem"  value="01">Item Lorem Ipsum 01</option>
            <option class="myItem"  value="02">Item 02</option>
            <option class="myItem"  value="03">Item 03</option>
        </select>
  </div>

<table data-dbTable="FattureSub" data-dbFieldKey="FattureSubId" data-dbFieldKeyType="int" class="table table-responsive table-extra-editable">
               <thead>
                   <tr data-row="0">
                       <th data-dbfield="PrestazioneCode"         data-dbtype="string">Codice</th>
                       <th data-dbfield="PrestazioneDescrizione"  data-dbtype="string">Descrizione</th>
                       <th data-dbfield="PrestazionePrezzo"       data-dbtype="float">Prezzo</th>
                       <th data-dbfield="PrestazioneQta"          data-dbtype="float">Qta</th>
                       <th>Imponibile</th>
                       <th>Sconto</th>
                       <th>Imposta</th>
                       <th>Totale</th>
                       <th>Note</th>
                   </tr>
               </thead>

               <tbody>
                   <tr data-row="0">
                     <!-- id deve essere univoco per la riga  -->
                       <td  id="code-%id%"   data-component="myDropDown"  class="cell-edit combo-save-text">%PrestazioneCode%</td>
                       <td  id="dex-%id%"    class="cell-edit">%PrestazioneDescrizione%</td>
                       <td  id="prezzo-%id%" class="cell-edit">%Prezzo%</td>
                       <td  id="qta-%id%"    class="cell-edit">%Qta%</td>
                       <td>%ImponibileT%</td>
                       <td>%ImponibileS%</td>
                       <td>%IVA%</td>
                       <td>%Importo%</td>
                       <td>%note%</td>
                   </tr>
               </tbody>
           </table>

NB l'id della riga deve avere un trattino - che separa il nome dall'id vero e proprio del record. Il js fa lo split di questo id e prende la parte destra per agganciare il record da modificare

Come usare i DropDown
Renderizza hidden il tuo myDropDown
nel tr/td dichieara il componente data-component="myDropDown"
se vuoi che invece dell'id scriva sul database il testo aggiungi la classe "combo-save-text"

se vuoi usare un dropdown che non salvi sul db (solo per selezioni e scelte azioni varie)
aggiungi la classe save-none (questa ha effetto su tutti i tipi di component)
nella function ApplyLocalChanges intercetta e gestisci cosa deve fare la scelta fatta
ricorda che ApplyLocalChanges deve risiedere nella tua pagina chiamante per le tue operazioni locali


Anche se non fanno nulla metti queste due functions nella pagina in cui renderizzi la table da editare.

AnchorEditableObjects();

function ApplyLocalChanges() {
            // nothing to do
}
function LiveUpdatePostAjax() {
            // nothing to do
}


==============
CHECKBOX usage
==============
metti nel td da controllare il checkbox e sostituisci il campo id record, e nome campo bool/bit da gestire

<td id="k14-%Id%" class="  itm-grid cell-edit" title="Contrassegna come inattivo"><input id="ck-%Id%" type="checkbox" title="Contrassegna come inattivo" class="i-checks form-control form-inline" checked="%YourBoolField-checked%" />     </td>

==============
extra-grid.css
==============

.cell-edit  {
    font-weight:bold !important;
    color:cadetblue;
    background-color:azure  !important;
}


==============
 Multiline
==============

Se i dati sono distribuiti su piu righe è necessario specificare l'attributo
data-row="0" nel tr dell'header e del body. la prima riga ha row 0, la seconda row 1 e cosi via


*/

// variabili pubbliche che hai a disposizione una volta che fai il click su una cella (da qualsiasi parte hi il controllo di tutti gli elementi della cella accedendo a questi oggetti)
var GridData = new Array();             // Componeni del body
var GridHeader = new Array();           // componenti di intestazione con le definizioni campi db/colonna
var CellValue = '';                     // valore della cella prima dell'edit (e dopo se la interroghi dopo l'input)
var InputValue = '';                    // nuovo valore inserito
var SelectedCell;                       // intera cella selezionata (con tutte le sue proprieta)
var LockCell = false;                   // serve a bloccare qualsiasi evento della cella quando è visualizzato il componente di editing
var CellData;                           // Contenuto completo che viene inviato al server per la storing dei dato sul campo
var CellId;                             // id del td selezionato
var EECDebug = true;                    // verbose on/off
var ClickRaised = false;

AnchorEditableObjects(); // quando viene carica il JS all'inclusione viene eseguito automaticamente il binding alle funzioni di live edit. commentalo ed eseguilo a mano se non vuoi che sia caricato sempre


function AnchorEditableObjects() {



    var EditableTablesCount = 0;
    $('.table-extra-editable').each(function () {
        EditableTablesCount++;
    });

    if (EditableTablesCount > 0)
        EECLog('Extra-Editable-Cell verbose on: AnchorEditableObjects applied to ' + EditableTablesCount + ' tables');

    $('.table-extra-editable').click(function () {

        // carica tutti i dati della grid 


        fetchDataGrid(this);

    });


    // per tutte le td che hanno cell-edit
    $('.cell-edit').click(function () {

        if (ClickRaised) return;

        EECLog(' --- ');
        EECLog('click raised on editable cell');

        if (isnull(GridData) || GridData.length == 0) {
            ECCLog('GridData null');
            fetchDataGrid($('.table-extra-editable'));
        }

        if (LockCell) {
            LockCell = false;
            return;
        }

        SelectedCell = $(this);
        CellValue = SelectedCell.text();

    
        //var newid = getUniqueId();

        CellId = SelectedCell.attr('id');

        CellData = getCell(CellId);  // questo oggetto contiene tutte le definizioni per agganciarsi al db, tabella, campo, tipo ecc

        if (isnull(CellData.field)) {
            EECLog('Cell ' + CellId + 'not editable or missing required properties');
            return;
        }
        EECLog('Id found for selected cell: ' + CellId);

        if (isnull(CellData)) EECLog('*WARNING* cell NULL exiting from getCell');

        EECLog('CellData.id ' + CellData.id + ' succesfully assigned');



        // creazione tag input e trasferimento dati, bind eventi e proprieta

        var col = $(document.createElement('div'));

        var dv = $('<div/>', {
            'class': 'myClass',
            //     'style': 'cursor:pointer;font-weight:bold;',
            //       'html': '<span>For HTML</span>',
            //  'click': function () { alert(this.id) },
            'mouseenter': function () { $(this).css('color', 'orange'); },
            'mouseleave': function () { $(this).css('color', 'gray'); }
        });

        var cls = '';
        var tx;
        CellData.isDatePicker = false;
        CellData.isCheckBox = false;
        if (SelectedCell.hasClass('text-right')) cls = 'text-right';
        if (CellData.type == 'date') CellData.isDatePicker = true;
        if (CellData.type == 'bool') CellData.isCheckBox = true;

     

        if (CellData.isCheckBox) {
         //   tx = HandleCheckBox(SelectedCell.find('.icheckbox_square-green'));
            tx = SelectedCell;
        }
        else {
            var comp = SelectedCell.attr('data-component');  // se esiste questo attributo vuol dire che il tipo è un DROPDOWN con componente definito nell'id della proprieta (es data-component="myDropDown" dove l'id è di un select hidden)

            if (!isnull(comp)) {
                tx = HandleDropDown(comp);  // se è definito un componente deve essere un dropdown (select:option)
            }
            else {
                tx = HandleInput(cls);      // assegna gli eventi del input
            }

            if (CellData.isDatePicker) tx = HandleDatePicker(tx);
        }

        if (CellData.isCheckBox == false) {
            $(this).text('');
            dv.append(tx);
            col.append(dv);
            $(this).append(col);
        }
        $(tx).focus();

        ClickRaised = true;


        $('input:checkbox').change(function (e) {

          //  alert('clicked');
            //var nval = $(this).attr('checked') == 'checked';
            //e.preventDefault();
            //var data = nval;
            //CellValue = data;
            //CellData.newvalue = CellValue;
            //ApplyLocalChanges(CellData); //<-- function locale specifica della tabella se deve fare dei calcoli (es calcolare l'importo se cambia prezzo o qta) 
            //LiveUpdate(CellData); // <-- qui invia le modifiche al server db
            //ClickRaised = false;
        });


    });

} // end AnchorEditableObjects 

// ==========================================
//   component HANDLERS 
// ==========================================
function HandleCheckBox(tx) {

    CellData.ComponentType = "checkbox";
    CellData.ComponentSaveMode = "bool";   // puo salvare true/false o 1/0 bit
    CellData.ComboSelectedValue = '';
    CellData.ComboSelectedText = '';

    //if(SelectedCell.hasClass('checkbox-save-bit') 
    //    CellData.ComponentSaveMode = "bit";

    EECLog('HandleCheckBox firex');
   
    EECLog($(tx).attr('class'));

    $(tx).on('click',function (e) {

        alert('clicked');
        //var nval = $(this).attr('checked') == 'checked';
        //e.preventDefault();
        //var data = nval;
        //CellValue = data;
        //CellData.newvalue = CellValue;
        //ApplyLocalChanges(CellData); //<-- function locale specifica della tabella se deve fare dei calcoli (es calcolare l'importo se cambia prezzo o qta) 
        //LiveUpdate(CellData); // <-- qui invia le modifiche al server db
        //ClickRaised = false;
    });

    $(tx).on('focus', function () {
        $(this).select();
    });


    //$(tx).on('blur', function () {
    //    EECLog('blur on checkbox');
    //    SelectedCell.text(CellValue);
    //    //  $(this).remove(); // destroy itself
     
    //})
    return tx;

}


function HandleDatePicker(tx) {
    // aggiunge il comportamento datepicker all'input gia creato         

    EECLog('DATEPICKER MODE ON');

    CellData.ComponentType = "datepicker";

    $(tx).addClass('datepicker');


    $(tx).datepicker({
        dateFormat: 'dd-mm-yy',
        language: "it",
        autoclose: true
    }).on("changeDate", function (e) {
        // alert("Working");
        LockCell = true;

        var date = formatDate($(this).datepicker('getDate'));
        var nval = date;
        EECLog('(datepicker seleced) valore selezionato per save: ' + nval);

        var data = nval;
        CellValue = data;
        CellData.newvalue = CellValue;
        SelectedCell.text(CellValue);

        $(this).remove();            // destroy itself
        ApplyLocalChanges(CellData); //<-- function locale. Metti qui dentro tutte le operazioni specifiche che deve fare nel contesto in cui si trova. usa  LiveUpdatePostAjax() se devi fare cose locali dopo l'update sul db'
        LiveUpdate(CellData);        // <-- qui invia le modifiche al server db 
        ClickRaised = false;
    });


    return tx;

}


function formatDate(longDate) {

    var cd = new Date(longDate);
    var month = cd.getMonth() + 1
    var day = cd.getDate();
    var year = cd.getFullYear();
    var d1 = day + "/" + month + "/" + year;
    return d1;
}

function HandleDropDown(comp) {

    // assegna eventi e comportamento del DropDown

    LockCell = true;

    CellData.ComponentType = "combo";
    if (SelectedCell.hasClass('combo-save-text'))
        CellData.ComponentSaveMode = "text";
    else
        CellData.ComponentSaveMode = "value";

    if (SelectedCell.hasClass('save-none'))
        CellData.ComponentSaveMode = "none";

    EECLog('Component found: save mode ' + CellData.ComponentSaveMode);

    var obj = $('#' + comp).clone();
    obj.removeClass('hidden');
    var dropdown = obj.find('select');
    tx = dropdown;

    $(tx).on('focus', function () {
        EECLog('focus on combobox');
        $(tx).find('option:contains(' + CellValue + ')').each(function () {
            if ($(this).text() == CellValue) {
                $(this).attr('selected', 'selected');
                EECLog('selected' + CellValue);
                return false;
            }
            return true;
        });

    });


    $(tx).on('blur', function () {
        EECLog('blur on combobox remove it');
        if (CellData.ComponentSaveMode != "none")
            SelectedCell.text(CellValue);
        $(this).remove(); // destroy itself
        ClickRaised = false;
    });

    $(tx).change(function () {

        if (CellData.ComponentSaveMode == "none") return;

        var nval = ''; // qui il dd puo salvare sia l'id che il testo, a seconda della presenza della classe combo-save-text

        CellData.ComboSelectedValue = $(this).val();
        CellData.ComboSelectedText = $(this).find('option:selected').text();

        if (CellData.ComponentSaveMode == 'text')
            nval = CellData.ComboSelectedText;
        else
            nval = CellData.ComboSelectedValue;

        EECLog('(change event) valore selezionato per save: ' + nval);

        var data = nval;
        CellValue = data;
        CellData.newvalue = CellValue;
        SelectedCell.text(CellValue);
        $(this).remove();            // destroy itself
        ApplyLocalChanges(CellData); //<-- function locale. Metti qui dentro tutte le operazioni specifiche che deve fare nel contesto in cui si trova. usa  LiveUpdatePostAjax() se devi fare cose locali dopo l'update sul db'
        LiveUpdate(CellData);        // <-- qui invia le modifiche al server db
        ClickRaised = false;
    });
    return tx;
}

function HandleInput(cls) {

    // assegna eventi e comportamento del Input Text

    CellData.ComponentType = "textbox";
    CellData.ComponentSaveMode = "text";
    CellData.ComboSelectedValue = '';
    CellData.ComboSelectedText = '';

    var tx = $('<input/>', {
        'id': 'flyInput',
        'type': 'Text',
        'title': 'Live Input',
        // 'data-toggle':'popover', 
        'class': 'form-control ' + cls,
        'value': CellValue,
        // 'data-placement':'top',
        'placeholder': '',
        'click': function () { LockCell = true }

        // 'onblur': function () { alert("uscito?") },
        //   'onkeyUp': function () { alert(this.id) },
        //   'size': '30'
    });


    $(tx).on('focus', function () {
        $(this).select();
    });

    if (CellData.isDatePicker == false) {
        $(tx).on('blur', function () {
            EECLog('blur on input: value = ' + CellValue);

            SelectedCell.text(CellValue);
            $(this).remove(); // destroy itself
            ClickRaised = false;
        });
    }

    $(tx).keydown(function (e) { // intercetta enter sul campo di input

        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
        if (key == 13) {
            e.preventDefault();
            var data = $(this).val();
            CellValue = data;
            CellData.newvalue = CellValue;
            SelectedCell.text(CellValue);
            $(this).remove(); // destroy itself
            ApplyLocalChanges(CellData); //<-- function locale specifica della tabella se deve fare dei calcoli (es calcolare l'importo se cambia prezzo o qta) 
            LiveUpdate(CellData); // <-- qui invia le modifiche al server db
            ClickRaised = false;
            // alert('premuto invio su input');
        } else {


            if (key == 113) // premuto F2 sul campo di ricerca, lo converte in popup piu grande che si veda meglio
            {
                bootbox.prompt("Edit cella " + campo, function (result) {
                    if (result == null) {
                        return;
                    } else {
                        e.preventDefault();
                        CellValue = result;
                        CellData.newvalue = CellValue;
                        SelectedCell.text(CellValue);
                        $(this).remove(); // destroy itself
                        ApplyLocalChanges(CellData); //<-- function locale specifica della tabella se deve fare dei calcoli (es calcolare l'importo se cambia prezzo o qta) 
                        LiveUpdate(CellData); // <-- qui invia le modifiche al server db
                        this.close;
                    }
                    return;
                });
            }

        }
    });
    return tx;
}

function fetchDataGrid(me) {

    if (ClickRaised) return;

    EECLog('EEC fetchDataGrid() checking mandatory properties for editable table..');

    var table = $(me).attr('data-dbTable');
    var FieldKey = $(me).attr('data-dbFieldKey');
    var FieldKeyType = $(me).attr('data-dbFieldKeyType');


    if (isnull(table)
        || isnull(FieldKey)
        || isnull(FieldKeyType)) {
        alert('attenzione. è stata trovata la classe table-extra-editable su un oggetto table ma mancano i requisiti minimi per fare il parsing di edit su grid. Devono essere specificati gli attributi di table data-dbTable con il nome della tabella sul db, data-dbFieldKey con il nome del campo chiave e data-dbFieldKeyType int o string con il tipo di chiave');
        return;
    }

    var tableId = $(me).attr('id');
    if (isnull(tableId)) tableId = ' without ID (set one)';
    EECLog('EEC id=' + tableId + ', data-dbTable=' + table + ',data-dbFieldKey=' + FieldKey + ',data-dbFieldKeyType=' + FieldKeyType);


    // su fld e type vengono assegnati i valori data-dbfield e data-dbtype delle righe di intestazione (th)
    // solitamente è una sola riga, e il secondo indice 1000 sono le colonne (td)
    // un massimo di 5 righe e 1000 colonne è piu che sufficiente a gestire la maggior parte dei casi.
    // se in intestazione ci fossero piu di 6 righe aumentare il primo indice
    var fld = [];
    var type = [];

    var row = 0;
    var cnt = 0;
    var i = 0;
    var cols = 0;
    $('.table-extra-editable tr:visible').each(function () {
        var col = [];

        var row = $(this).attr('data-row');
    //    console.log('data-row=' + row);
        if (isnull(row)) row = 0;
        cnt++;
        // conta le colonne
        $(this).children("th").each(function (idx) {
            if (idx > cols) cols = idx;
        });

        $(this).children("th").each(function (idx) {
           
            var f = $(this).attr('data-dbfield');
            var t =  $(this).attr('data-dbtype');
            i = (row * cols) + (idx + 1);

            fld[i] = f;
            type[i] = t;
            
         //   if (cnt < 6000) console.log('TH ' + row + ',' + idx + ' , ' + i + ' = ' + f);

        });


        $(this).children("td").each(function (idx) {
            // per ogni cella raccoglie le info che dopo dovra inviare ad ajax
            //  console.log('loopcells ' +row+'\\'+idx +'\\' + fld[idx] + '\\' + $(this).attr('id') );

              i = (row * cols) + (idx + 1);

         //   if (cnt < 6) console.log(row + ',' + idx + ' , ' + i + ' = ' + fld[i] + ',value =' + $(this).text());

            GridData.push({
                table: table,                // nome tabella
                row: row,                    // indice della riga
                idx: idx,                    // indice della colonna sulla riga
                id: $(this).attr('id'),      // id univoco della cella (assicurati che sia univoco) 
                field: fld[i],         // nome campo db
                type: type[i],        // tipo di dati 
                fieldkey: FieldKey,          // campo chiave
                fieldkeytype: FieldKeyType,  // tipo di campo chiave 
                value: $(this).text()        // valore  
            });
        });

    });

}




function getCell(id) {

    // restituisce le informazioni della cella con id = a quello passato
    var out;
     
    GridData.forEach(function (cell, index) {

       //   console.log('getCell: ' + cell.row + '\\' +cell.idx);

        if (cell.id == id) {

            out = cell;

            return;
        }

    });

    return out;

}



// log solo se il debug è attivo, da disattivare in produzione perche scrive parecchia roba

function EECLog(msg) {
    if (EECDebug) console.log(msg);
}



function LiveUpdate(CellData) {

    /*
        obj client side
     CellData
                    table: table, 
                    row:   row,
                    idx:   idx,
                    id:    $(this).attr('id'),
                    field: fld[idx],
                    type:  type[idx],
                    fieldkey: FieldKey,
                    fieldkeytype: FieldKeyType,
                    value: $(this).text()
    
        // obj on server side
    C#  (è nelle entities del dataservice) DoAjaxMethind is the script to create the ajax call on server side from here
        public string Action = "edit";
        public string Table = "";
        public string Field = "";
        public string FieldType = "";
        public string FieldKey = "";
        public string FieldKeyType = "";
        public string Value = "";
        public string OldValue = "";
        public string RkID = "";
        public string TagID = "";
        public string RowNum = "";
        public string ColNum = "";

   for Java or PHP handle your way to fetch server side
    
    */

    if (isnull(CellData)
        || isnull(CellData.field)
        || isnull(CellData.type)) {
        bootbox.alert('Attenzione, Non tutte le caratteristiche per l editing su grid sono state configurate correttamente. Nel th della colonna devi mettere data-dbfield con il nome della colonna sul db e data-dbtype con il tipo (string, int, float)');
        //console.log('ajax non puo elaborare la richiesta LiveUpdate per la Extra-Editable function perche mancano le definizioni del campo o tipo (attributo data-dbfield e data-dbtype del td) )');
        return;
    }

    var pid = 15;
    var method = "LiveUpdate";
    var data = {};
    data.dati = {};

    var ar = CellData.id.split('-')
    var id = ar[1];
    data.dati.Action = 'edit';
    data.dati.Table = CellData.table;
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

    if (CellData.value == CellData.OldValue) return;

    DoAjaxMethod(method, data, pid);


}

