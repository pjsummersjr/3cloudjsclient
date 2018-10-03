
var config = require('./appConfig.js');
var apiConfig = require('./apiConfig');

document.getElementById('login').addEventListener("click", login);
document.getElementById('logout').addEventListener("click", logout);
document.getElementById('getstuff').addEventListener("click", loadContent);

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
    document.getElementById('status').innerHTML = `<span>Logged in: ${user.profile.name}</span>`;
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
            document.getElementById('app').innerHTML = this.responseText;
        });
        req.open("GET", resourceEndpoint);
        req.setRequestHeader("Authorization", "Bearer " + bearerToken);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Cache-Control", "no-cache");
        
        req.send();
    })
}


