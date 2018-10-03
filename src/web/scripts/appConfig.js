appConfig = {
    instance:"https://login.microsoftonline.com/",
    tenant: "microsoft.onmicrosoft.com",
    clientId:"90ba8041-52a6-45bb-86e1-862ec0af4ac2",   //simpleexpresswebapp client id
    postLogoutRedirectUrl: window.location.hash,
    redirectUri: 'http://localhost:3000',    
    disableRenewal: true,
    extraQueryParameter: 'nux=1',
    endpoints: {
        'https://simpleappserver.azurewebsites.net/api':'https://simpleappserver.azurewebsites.net'
    },
    responseType:'token',
    //cacheLocation:'localStorage'
}

module.exports = appConfig;