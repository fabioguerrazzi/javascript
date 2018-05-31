
Extra Editable Teble Cell - Fabio Guerrazzi 4 Extra.Cube - Handler LiveEdit Cells for any Table
v 1.0 20/04/2018 - input cell live update
v 1.1 25/05/2018 - added DropDown
v 1.2 31/05/2018 - added data-row attrib to tr to handle multiline


PLEASE DO NOT EDIT Extra-EditableCells.js for specific statements case/switch,this plugin
has to be kept as abstract.
Create all the local functionalities in ApplyLocalChanges that can reside in your page

Include this js in the page where you wish to transform a table to an editable 

Requirements: (values betewwn % mean they are variables)

hidden dropdown
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
                       <th data-dbfield="PrestazioneCode"         data-dbtype="string">Code</th>
                       <th data-dbfield="PrestazioneDescrizione"  data-dbtype="string">Description/th>
                       <th data-dbfield="PrestazionePrezzo"       data-dbtype="float">Price</th>
                       <th data-dbfield="PrestazioneQta"          data-dbtype="float">Qty</th>
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
