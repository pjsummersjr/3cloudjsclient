
var config = require('./appConfig.js');
var apiConfig = require('./apiConfig');

document.getElementById('login').addEventListener("click", login);
document.getElementById('logout').addEventListener("click", logout);
//document.getElementById('').addEventListener("click", loadContent);

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
    document.getElementById('status').innerHTML = `<span>Welcome, ${user.profile.name}</span>`;
    document.getElementById('status-row').hidden = false;
    loadContent();
}
else {
    document.getElementById('login').hidden = false;
    document.getElementById('logout').hidden = true;
}

function login() {
    console.log('Logging in');
    document.getElementById('status').innerHTML = "<span>Just logging in</span>";
    authContext.login();
}

function logout(){
    console.log('Logging out');
    document.getElementById('status').innerHTML = "<span>Just logging out</span>";
    authContext.logOut();
}

/**
 * 
 */
function loadContent() {
    var req = new XMLHttpRequest();
    var resourceEndpoint = apiConfig.serviceEndpointUrl + "/api";
    
    console.log(`Trying to retrieve data from ${resourceEndpoint}`);
    console.log(`Using app id: ${apiConfig.serviceAppId}`)
    //Have to use the application id of my API as the resource for the acquireToken call
    authContext.acquireToken(apiConfig.serviceAppId, function (error, token) { 
        if(error) {
            console.log(error);
        }   
        var bearerToken = token;
        req.addEventListener('load', function() {
            //document.getElementById('content').innerHTML = this.responseText;
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
        });
        req.open("GET", resourceEndpoint);
        req.setRequestHeader("Authorization", "Bearer " + bearerToken);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Cache-Control", "no-cache");
        
        req.send();
    })
}


