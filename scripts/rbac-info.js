const titleNodeName = "explorer-lists__list__group__name__label__text",
    itemNodeName = "explorer-lists__list__item",
    itemTextNodeName = ".explorer-lists__list__group__name__label__text",
    toggleNodeName = "button.explorer-lists__list__group__name__button",
    rowNodeClass = "explorer-lists__list__group";

var permsData;

async function initRbac() {
    // https://management.azure.com/providers/Microsoft.Authorization/providerOperations?%24expand=resourceTypes&api-version=2022-04-01
    permsData = await (await fetch(chrome.runtime.getURL("data/rbac.min.json"))).json();
    permsData = permsData.value;

    //var nodeName = document.querySelectorAll("explorer-lists__list__group__name__label__text");
}

function attachClickEventsToToggleNodes() {
    // find our toggles
    document.querySelectorAll(toggleNodeName)
        .forEach(el => {
            el.addEventListener("click", toggleNodeClickHandler);
        });
}

function toggleNodeClickHandler(e) {
    var textNodes = this.parentNode.querySelectorAll(itemTextNodeName);
    console.log(`found ${textNodes.length}, expanded: ${textNodes[0].innerText}`);
}

function findResourceProviderInPermissionsData(resourceProvider) {
    permsData
}

function initRbacData() {
    console.log("init rbac data");
    initRbac();
    attachClickEventsToToggleNodes();
}

function connectObservers() {
    // observer for the main page
    var observer = new MutationObserver(function (mutations, obs) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(node => {
                // todo: be defensive
                console.log(node.className);
                if (node.className.toLowerCase() === rowNodeClass.toLowerCase()) {
                    console.log("got one");
                    obs.disconnect();
                    initRbacData();
                }
            });
            //console.log(mutation);
        });
    });

    var config = { childList: true, subtree: true };
    observer.observe(document.body, config);
}

connectObservers();