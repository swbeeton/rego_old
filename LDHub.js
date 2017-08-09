<!-- embed this code in a Content Editable Web Part (Edit HTML) -->


<!-- Add moment.js to properly format time values -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"></script>

<script type="text/javascript">
	
// update these items to match your configuration
var eventList = '<Your event list here>';
var registrationList = '<Your registration list here>';

var event = getUrlVar("Event");


// Set defaults in case the Session ID URL parameter is missing
var Title = "Session not found";
var Day = ""
var SessionDate = "";
var Duration = "";
var Description = "Session has not been found. You may have come to this page in error, or the session may have been removed. Contact Learning Express for further enquiries.";


// The following function and it's delegates retrieve the User ID of the user and updates the Global userid variable to be used later.


function getUserID() {

	var context = new SP.ClientContext.get_current();
	this.currentUser = context.get_web().get_currentUser();
	context.load(currentUser);

	context.executeQueryAsync(
		function () {  // On success
			return currentUser.get_loginName().replace('ATONET\\', '');
		},
		function () { // On fail
			alert('Error: ' + args.get_message() + '\n' + args.get_stackTrace());
		}
	);

}

// Checks the registration list to see if the user has already registered. If so, update the form to state as such and set the "isRegistered" global variable to true.	
var isRegistered = false;
var registrationId = 0;

function checkRegistered(user_id, event_id) {

	var clientContext = new SP.ClientContext.get_current();
	var oList = clientContext.get_web().get_lists().getByTitle(registrationList);

	var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml(
		'<View><Query><Where><And>' +
		'<Eq><FieldRef Name=\'Title\'/>' +
		'<Value Type=\'Text\'>' + user_id + '</Value></Eq>' +
		'<Eq><FieldRef Name=\'Session\'/>' +
		'<Value Type=\'Number\'>' + event_id + '</Value></Eq>' +
		'</And></Where></Query><RowLimit>1</RowLimit></View>');
		
	this.collListItem = oList.getItems(camlQuery);

	clientContext.load(collListItem);

	clientContext.executeQueryAsync(
		function () {
			return true;
		},
		function () {
			return false;
		}
	);

}

function checkRegistered_onQuerySucceeded(sender, args) {

	var listItemInfo = '';

	var listItemEnumerator = collListItem.getEnumerator();

	if (collListItem.get_count() > 0) {
		isRegistered = true;
		$("#submitRegistration_Button").attr('value', 'Cancel Registration');
		$("#feedback > p").html('You have registered for this event, click on the "Cancel Registration" button to remove your registration');
		while (listItemEnumerator.moveNext()) {
			var oListItem = listItemEnumerator.get_current();
			registrationId = oListItem.get_id();
		}
	} else {
		isRegistered = false;
		$("#submitRegistration_Button").attr('value', 'Register Now');
		$("#feedback > p").html('To register for this event, please click on the "Register Now" button');
	}

}

function checkRegistered_onQueryFailed(sender, args) {
	alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

// The following functions and delegates retrieve the event from the "Event" URL parameter and updates the form.  
var targetListItem;

function retrieveListItem() {

	if (getUrlVar("Event") != undefined) {
		
		var clientContext = new SP.ClientContext.get_current();
		var oList = clientContext.get_web().get_lists().getByTitle(eventList);

		this.targetListItem = oList.getItemById(getUrlVar("Event"));

		clientContext.load(targetListItem, 'Title', 'Description', 'Day', 'Date', 'Site', 'Calculated_x0020_Duration');

		clientContext.executeQueryAsync(
			Function.createDelegate(this, this.retrieveListItem_onQuerySucceeded),
			Function.createDelegate(this, this.retrieveListItem_onQueryFailed)
		);
		
	} else {

		$("#sessionTitle").html(Title);
		$("#sessionDescription").html(Description);
		document.getElementById("submitRegistration_Button").disabled = true;
		$("#feedback > p").html('Unable to find event. Go back to continue browsing or contact us');
	}

}

function retrieveListItem_onQuerySucceeded(sender, args) {

	Title = targetListItem.get_item('Title');
	Day = targetListItem.get_item('Day')
	SessionDate = targetListItem.get_item('Date');
	Description = targetListItem.get_item('Description');
	Site = targetListItem.get_item('Site');
	Duration = targetListItem.get_item('Calculated_x0020_Duration');

	$("#sessionTitle").html(Title);
	$("#sessionDate").html(moment(SessionDate).format("dddd, D MMMM YYYY"));
	$("#sessionTime").html(moment(SessionDate).format("h:mma") + ' (AEST) - ' + Duration);
	$("#sessionDescription").html(Description);

}

function retrieveListItem_onQueryFailed(sender, args) {

	alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());

}

function submitRegistration() {

	if (isRegistered === false) {
		addRegistration();
	} else {
		deleteRegistration();
	}

}

function addRegistration() {

	var context = new SP.ClientContext.get_current();
	var web = context.get_web();
	var list = web.get_lists().getByTitle(registrationList);
	var listItemCreationInfo = new SP.ListItemCreationInformation();
	var newItem = list.addItem(listItemCreationInfo);

	newItem.set_item('Title', userid);
	newItem.set_item('Session', getUrlVar("Event"));
	newItem.update();

	context.executeQueryAsync(
		Function.createDelegate(this, this.SubmitRegistration_onQuerySucceeded),
		Function.createDelegate(this, this.SubmitRegistration_onQueryFailed)
	);

}

function SubmitRegistration_onQuerySucceeded() {
	checkRegistered();
}

function SubmitRegistration_onQueryFailed(sender, args) {
	alert('failed. Message:' + args.get_message());
}

function deleteRegistration() {

	var clientContext = new SP.ClientContext.get_current();
	var oList = clientContext.get_web().get_lists().getByTitle(registrationList);

	this.oListItem = oList.getItemById(registrationId);

	oListItem.deleteObject();

	clientContext.executeQueryAsync(
		Function.createDelegate(this, this.deleteRegistration_onQuerySucceeded),
		Function.createDelegate(this, this.deleteRegistration_onQueryFailed)
	);

}

function deleteRegistration_onQuerySucceeded() {
	checkRegistered();
}

function deleteRegistration_onQueryFailed(sender, args) {
	alert('failed. Message:' + args.get_message());
}


ExecuteOrDelayUntilScriptLoaded(retrieveListItem, "sp.js");
ExecuteOrDelayUntilScriptLoaded(getUserID, "sp.js");

</script>

<div id="sessionDetails">
<p style="text-align: center"><img width="328" height="424" src="/TASites/LearningHub/LearningExpressMarketing/LearningExpressHub.jpg" alt="" style="height: 209px; width: 163px; margin: 5px"/></p>
<p>&#160;</p>
<h2 class="regPageTitle">Learning Hub Registration Page</h2>
<h3 id="sessionTitle" class="regPageSubTitle"></h3>
<h4 id="sessionDate"></h4>
<h4 id="sessionTime"></h4>
<div id="sessionDescription"></div>
<div id="feedback"><p></p></div>
<input name="" 
       class="ms-ButtonHeightWidth" 
       id="submitRegistration_Button" 
       accesskey="O" 
       onclick="submitRegistration(); return(false);" 
       type="button" 
       target="_self" 
       value="Register Now"
			 
       /> 
</div>


<style>
  
/* Update styles to match your branding */  
  
#sessionDetails {
	color: purple!important;
	text-align: center;
	width: 700px;
	margin: auto;
	font-size: 16px;
	font-weight: normal;
}

#sessionDetails h2,
#sessionDetails h3,
#sessionDetails #sessionDate,
#sessionDetails #sessionTime,
#sessionDetails #sessionDescription,
#feedback> p {
	font-family: "segoe ui light", "segoe ui";
	font-weight: 300;
	color: purple;
}

#sessionDetails h2 {
	border: none;
	font-size: 2em;
	margin: 0em 0 0.5em;
}

#sessionDetails h3 {
	border: none;
	font-size: 1.5em;
	margin: 1em 0 1em;
}

#sessionDetails #sessionDate,
#sessionDetails #sessionTime {
	display: block;
	font-size: 1.2em;
	margin: 0 0 0.5em;
	line-height: 1.2em;
}

#sessionDetails #sessionDescription {
	text-align: left;
	font-size: 1em;
	margin: 1.5em 0 2em;
}


/* override gray background defined in template.master */

.s4-wpTopTable {
	background-color: white!important;
}


/* style the submit button - Must be configured for each list form */

#sessionDetails input {
	height: auto;
	font-family: "segoe ui light", "segoe ui";
	font-weight: 300;
	font-size: 1.5em;
	padding: 0.5em 1em;
	margin: 0 auto;
	border: none;
	display: block;
	background: purple;
	color: white;
}

#sessionDetails input:hover {
	cursor: pointer;
}

#feedback> p {
	color: red;
	font-size: 1em;
}

</style>
