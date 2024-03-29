

if ('serviceWorker' in navigator) {
    //tabSyncReady = new Promise(); 
    navigator.serviceWorker.register('service-worker.js')
        .then(function () {
            return navigator.serviceWorker.ready;
        })
        .then(function (reg) {
            console.log('Service Worker is ready', reg);
            navigator.serviceWorker.addEventListener('message', function (event) {
                var data;
                if (event.data) {
                    console.error(event)
                    data = event.data;
                    if (data.property === "counter" && data.state !== undefined) {
                        setCounter(data.state, true);
                    }

                    if (data.property === "clients" && data.state !== undefined) {
                        setClients(data.state, true);
                    }
                }
            });
            window.onbeforeunload = () => {
                //retrigger tab events
                stateToServiceWorker({ property: "new-client-added" });
            }
            stateToServiceWorker({ property: "new-client-added" });
        }).catch(function (error) {
            console.log('Error : ', error);
        });
}

initCounter();

function initCounter() {

    // We use localstorage but easily could use IndexDB!
    var validStoredCounter = localStorage.getItem("counter") !== undefined &&
        localStorage.getItem("counter") !== null &&
        localStorage.getItem("counter") !== "NaN"

    if (validStoredCounter) {
        var count = parseInt(localStorage.getItem("counter"));
        setCounter(count, false);
    } else {
        setCounter(0, false);
    }

    document.getElementById("increment").addEventListener("click", increment);
    document.getElementById("decrement").addEventListener("click", decrement);

}

function decrement(event) {
    var count = getCount() - 1;
    setCounter(count, false)
}

function increment(event) {
    var count = getCount() + 1;
    setCounter(count, false)
}

function getCount() {
    var count = parseInt(document.getElementById("counter").innerHTML);
    if (!isNaN(count)) {
        return count;
    } else {
        return 0;
    }
}

function setCounter(count, fromOtherTab) {
    document.getElementById("counter").innerHTML = parseInt(count);
    if (!fromOtherTab) {
        localStorage.setItem("counter", count);
        stateToServiceWorker({ property: "counter", state: count });
    }
}

function setClients(count) {
    document.getElementById("clients").innerHTML = parseInt(count);
}

function stateToServiceWorker(data) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller
            .postMessage(data);
    }
}
