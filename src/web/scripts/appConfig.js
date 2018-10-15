appConfig = {
/*     instance:"https://login.microsoftonline.com/",
    tenant: "microsoft.onmicrosoft.com", */
    clientId:"0f8bcfd7-1c70-4d4c-9a67-272289afb0e0",   //ThreeCloudClient v2 App Id
/*     postLogoutRedirectUrl: window.location.hash,
    redirectUri: 'http://localhost:3000',    
    disableRenewal: true,
    extraQueryParameter: 'nux=1',

    responseType:'token',
    //cacheLocation:'localStorage' */    
    endpoints: {
        'https://simpleappserver.azurewebsites.net/api':'https://simpleappserver.azurewebsites.net',
        'https://localhost:3001':'https://localhost:3001',
        'https://pjsummersjr2.ngrok.io':'https://pjsummersjr2.ngrok.io'
    },
    scope:["api://8734ea12-7acc-4ed8-9130-866ef21c7bb5/access_as_user"]    
    //scope:["https://graph.microsoft.com/user.read"]
    //scope:["0f8bcfd7-1c70-4d4c-9a67-272289afb0e0"]
    //scope:["https://pjsummersjr2.ngrok.io"]
    //scope:["0fdbfd56-4931-4c39-bdb2-8d88fdac47d8"]
}

module.exports = appConfig;