// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    // The promise that skipWaiting() returns can be safely ignored.
    self.skipWaiting();
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    //console.log("Activate event")
});


self.addEventListener('message', function (event) {
    //console.log("Message recieved in service worker:", event);
    var data = event.data;
    var clientId = event.source.id
    if (data.property === "new-client-added") {
        self.syncTabState({ property: "clients" }, null);
        return
    }
    self.syncTabState(data, clientId);

});


self.sendTabState = function (client, data) {
    client.postMessage(data);
}

self.syncTabState = function (data, clientId) {
    clients.matchAll().then(clients => {
        if (data.property === "clients") {
            data.state = clients.length
        }
        clients.forEach(client => {
            // No need to update the tab that 
            // sent the data
            if (client.id !== clientId) {
                self.sendTabState(client, data)
            }

        })
    })
}