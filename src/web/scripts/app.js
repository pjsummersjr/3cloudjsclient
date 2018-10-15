
var config = require('./appConfig.js');
var apiConfig = require('./apiConfig');
/**
 * Register different button event handlers
 */
document.getElementById('login').addEventListener("click", login);
document.getElementById('logout').addEventListener("click", logout);
document.getElementById('docs').addEventListener("click", getDocuments);
document.getElementById('engagements').addEventListener("click", getEngagements);

var authContext = null;

var msalObj = new Msal.UserAgentApplication(config.clientId,
    null,
    handleTokenRedirect,
    {redirectUri:"https://pjsummersjr.ngrok.io"});

function handleTokenRedirect(token) {
    console.log("Handling token redirect");
    if(token){
        console.log(token);
    }
}

var user = msalObj.getUser();

if(user){
    initLoggedIn();
}
else {
    initNotLoggedIn(null);
}
/**
 * This method is called at page load if the user object is already cached or after successful login
 */
function initLoggedIn(){
    console.log(`User ${user.name} is currently logged in right now.`);
    document.getElementById('login').hidden = true;
    document.getElementById('logout').hidden = false;
    document.getElementById('user-info').innerHTML = `Welcome, ${user.name}`;
    document.getElementById('userInfo-nav').hidden = false;
    getDocuments();
    //getDocuments(renderDocuments);
}
/**
 * This function is called at page load if the user object is not already cached or after a failed login
 * @param {*} error 
 */
function initNotLoggedIn(error){

    document.getElementById('login').hidden = false;
    document.getElementById('logout').hidden = true;
    document.getElementById('userInfo-nav').hidden = true;
    if(error){
        document.getElementById('content').innerHTML = `<span>There has been an error logging in: ${error}. Please try again!</span>`;
    }else {
        document.getElementById('content').innerHTML = "<span>Click the login button above to get some data</span>";
    }
    
}
/**
 * Login event handler. Called when the login button is clicked.
 */
function login() {
    msalObj.loginPopup(appConfig.scope).then(
        function(idToken) {
            user = msalObj.getUser();
            initLoggedIn();
        },
        function (error) {
            initNotLoggedIn(error);
        }
    )
}
/**
 * Logout event handler. Called when the logout button is clicked.
 */
function logout(){
    msalObj.logout();
}

function getEngagements() {
    resetContent("Engagements");
    document.getElementById("content-title").innerHTML = "<b>Engagements</b>";
    var endpoint = apiConfig.serviceEndpointUrl + "/api/engagements";
    loadContent(renderEngagements, endpoint);
}

function getDocuments() {
    resetContent("Documents");
    document.getElementById("content-title").innerHTML = "<b>Documents</b>";
    var endpoint = apiConfig.serviceEndpointUrl + "/api/docs";
    loadContent(renderContentDocuments, endpoint);
}

function resetContent(contentType) {    
    document.getElementById("content-title").innerHTML = `<b>Loading ${contentType}</b>`;
    document.getElementById("content").innerHTML = "";
}
var activeEngagement = null;
function getRelatedDocuments(keywords, id){
    console.log("Related documents: " + keywords);
    var endpoint = `${apiConfig.serviceEndpointUrl}/api/docs/related/${keywords}`;
    if(activeEngagement){
        document.getElementById(`docs_${activeEngagement}`).innerHTML = null;
        document.getElementById(`docs_${activeEngagement}`).hidden = true;
    }
    activeEngagement = id;
    loadContent(renderEngagementDocuments, endpoint);
}

/**
 * 
 */
function loadContent(renderFunc, endpoint) {
    var scope = appConfig.scope; //[appConfig.clientId];
    var resourceEndpoint = endpoint;
    //var resourceEndpoint = "https://graph.microsoft.com/v1.0/me/drive/root/children";
    msalObj.acquireTokenSilent(scope).then(
        function(accessToken) {
            var req = new XMLHttpRequest();
            req.addEventListener('load', renderFunc);
            req.open('GET', resourceEndpoint);
            req.setRequestHeader("Authorization", "Bearer " + accessToken);
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Cache-Control", "no-cache");

            req.send();
        },
        function(error) {
            console.log(`Error retrieving access token. Trying to acquire token with Popup`);
            console.error(error);           

            msalObj.acquireTokenPopup(scope).then(
                function(newAccessToken){
                    var req = new XMLHttpRequest();
                    req.addEventListener('load', renderFunc);
                    req.open('GET', resourceEndpoint);
                    req.setRequestHeader("Authorization", "Bearer " + newAccessToken);
                    req.setRequestHeader("Content-Type", "application/json");
                    req.setRequestHeader("Accept", "application/json");
                    req.setRequestHeader("Cache-Control", "no-cache");
        
                    req.send();
                },
                function(newError){
                    console.log(`Errror retrieving token at popup too. ${newError}`);
                    throw(`Error retrieving valid access token from API:\n\t${newError}`)
                }
            ) 
        }
    );
/*     var req = new XMLHttpRequest();
    var resourceEndpoint = endpoint;
    
    console.log(`Trying to retrieve data from ${resourceEndpoint}`);
    console.log(`Using app id: ${apiConfig.serviceAppId}`)
    //Have to use the application id of my API as the resource for the acquireToken call
    authContext.acquireToken(apiConfig.serviceAppId, function (error, token) { 
        if(error) {
            console.log(error);
        }   
        var bearerToken = token;
        req.addEventListener('load', renderFunc);
        req.open("GET", resourceEndpoint);
        req.setRequestHeader("Authorization", "Bearer " + bearerToken);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Cache-Control", "no-cache");
        
        req.send();
    }) */
}

function renderContentDocuments(){
    renderDocuments("content", this.responseText);
}

function renderEngagementDocuments() {
    renderDocuments(`docs_${activeEngagement}`, this.responseText);
    document.getElementById(`docs_${activeEngagement}`).hidden = false;
}

function renderDocuments(elId, docsAsString) {
    //var elId = "content";
    var docsAsJson = JSON.parse(docsAsString);
    console.log(docsAsJson);
    var responseStr = `<div class="container">`;
    docsAsJson.value.map((item, index) => {
        responseStr += `<div class"row"><div class="col-sm col-12">`;
        responseStr += `${item.name}`;
        responseStr += `</div></div>`;
    })
    responseStr += `</div>`;
    console.log(`Loading documents to body element ${elId}`)
    document.getElementById(elId).innerHTML = responseStr;
}


function renderEngagements() {
    var docsAsJson = JSON.parse(this.responseText);
    console.log(docsAsJson);
    var responseStr = "";
    var contentEl = document.getElementById("content");
    docsAsJson.value.map((item, index) => {
        var outerDiv = document.createElement("div")
        outerDiv.classList = "card";
        var cardBody = document.createElement("div");
        cardBody.classList = "card-body";
        var titleEl = document.createElement("h5");
        titleEl.classList = "card-title";
        var titleText = document.createTextNode(item.mtc_title);
        titleEl.appendChild(titleText);
        var button = document.createElement("button");
        button.classList = "btn";
        var butText = document.createTextNode("Related Documents");
        button.addEventListener("click", function() { getRelatedDocuments(item.mtc_siebelaccountname, item.mtc_engagementnumber) });
        button.appendChild(butText);
        var docDiv = document.createElement("div");
        docDiv.id = `docs_${item.mtc_engagementnumber}`;
        docDiv.hidden = true;

        //Compose higher level component
        outerDiv.appendChild(cardBody);
        cardBody.appendChild(titleEl);
        cardBody.appendChild(button);
        cardBody.appendChild(docDiv);
        contentEl.appendChild(outerDiv);
       /*  responseStr += `<div class="card"><div class="card-body">`;
        responseStr += `<h5 class"card-title">${item.mtc_title}</h5>`;
        responseStr += `<h6 class="card-subtitle mb-2 text-muted">${item.mtc_siebelaccountname}</h6>`
        responseStr += `<p class="card-text">${item.mtc_goal}</p>`
        responseStr += `<button id="related_${item.mtc_engagementnumber}" onclick="alert('Something')">Related Documents</button>`
        responseStr += `<a href="#" class="card-link">Related Engagements</a>`
        responseStr += `</div></div>`; */
        //document.getElementById(`related_${item.mtc_engagementnumber}`).addEventListener("click", getRelatedDocuments);
    })
    
    //document.getElementById('content').innerHTML = responseStr;
}


