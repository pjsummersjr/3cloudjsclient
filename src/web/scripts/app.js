
var config = require('./appConfig.js');
var apiConfig = require('./apiConfig');
/**
 * Register different button event handlers
 */
document.getElementById('login').addEventListener("click", login);
document.getElementById('logout').addEventListener("click", logout);
document.getElementById('docs').addEventListener("click", getDocuments);
document.getElementById('engagements').addEventListener("click", getEngagements);


var authContext = new AuthenticationContext(config);
console.log('Initialized authContext');
var isCallback = authContext.isCallback(window.location.hash);
authContext.handleWindowCallback();

if(isCallback && !authContext.getLoginError()){
    window.location = authContext._getItem(authContext.CONSTANTS.STORAGE.LOGIN_REQUEST);
}

var user = authContext.getCachedUser();

if(user){
    console.log(user);
    document.getElementById('login').hidden = true;
    document.getElementById('logout').hidden = false;
    document.getElementById('user-info').innerHTML = `Welcome, ${user.profile.name}`;
    document.getElementById('userInfo-nav').hidden = false;
    getDocuments(renderDocuments);
}
else {
    document.getElementById('login').hidden = false;
    document.getElementById('logout').hidden = true;
    document.getElementById('userInfo-nav').hidden = true;
    document.getElementById('content').innerHTML = "<span>Click the login button above to get some data</span>";
}

function login() {
    console.log('Logging in');
    //document.getElementById('status').innerHTML = "<span>Just logging in</span>";
    authContext.login();
}

function logout(){
    console.log('Logging out');
    //document.getElementById('status').innerHTML = "<span>Just logging out</span>";
    authContext.logOut();
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
    loadContent(renderDocuments, endpoint);
}

function resetContent(contentType) {    
    document.getElementById("content-title").innerHTML = `<b>Loading ${contentType}</b>`;
    document.getElementById("content").innerHTML = "";
}

/**
 * 
 */
function loadContent(renderFunc, endpoint) {
    var req = new XMLHttpRequest();
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
    })
}

function renderDocuments() {
    
    var docsAsJson = JSON.parse(this.responseText);
    console.log(docsAsJson);
    var responseStr = `<div class="container">`;
    docsAsJson.value.map((item, index) => {
        responseStr += `<div class"row"><div class="col-sm col-12">`;
        responseStr += `${item.name}`;
        responseStr += `</div></div>`;
    })
    responseStr += `</div>`;
    document.getElementById('content').innerHTML = responseStr;
}

function renderEngagements() {
    var docsAsJson = JSON.parse(this.responseText);
    console.log(docsAsJson);
    var responseStr = "";
    docsAsJson.value.map((item, index) => {
        responseStr += `<div class="card"><div class="card-body">`;
        responseStr += `<h5 class"card-title">${item.mtc_title}</h5>`;
        responseStr += `<h6 class="card-subtitle mb-2 text-muted">${item.mtc_siebelaccountname}</h6>`
        responseStr += `<p class="card-text">${item.mtc_goal}</p>`
        responseStr += `<a href="#" class="card-link">Related Documents</a>`
        responseStr += `<a href="#" class="card-link">Related Engagements</a>`
        responseStr += `</div></div>`;
    })
    
    document.getElementById('content').innerHTML = responseStr;
}


