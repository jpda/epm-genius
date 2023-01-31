const titleNodeName = "explorer-lists__list__group__name__label__text",
    itemNodeName = "div.explorer-lists__list__item",
    itemGroupNodeName = "div.explorer-lists__list__group",
    itemTextNodeName = "div.explorer-lists__list__group__name__label__text",
    toggleNodeName = "button.explorer-lists__list__group__name__button",
    rowNodeClass = "explorer-lists__list__group";


var permsData = null;

// todo: probably want to switch to a live call, maybe once every day, week, etc. and cache
// to keep it fresh as more RPs come online
async function initRbac() {
    // https://management.azure.com/providers/Microsoft.Authorization/providerOperations?%24expand=resourceTypes&api-version=2022-04-01
    if (permsData) { console.log("already loaded rbac data"); return; }
    console.log(`loading perms data from ${chrome.runtime.getURL("data/rbac.min.json")}`);
    var localPermissionsData = await (await fetch(chrome.runtime.getURL("data/rbac.min.json"))).json();
    this.permsData = localPermissionsData.value;
    console.log(`loaded ${this.permsData.length} perms`);
}

function attachClickEventsToToggleNodes() {
    // find our toggles
    document.querySelectorAll(toggleNodeName)
        .forEach(el => {
            el.addEventListener("click", toggleNodeClickHandler);
        });
}

function toggleNodeClickHandler(e) {
    console.log(`got click on ${this}`);
    var rpNameNode = this.parentNode.querySelectorAll(itemTextNodeName);
    var rpName = rpNameNode[0].innerText;
    console.log(`found ${rpNameNode.length}, expanded: ${rpName}`);

    var rp = findResourceProviderInPermissionsData(rpName);
    if (!rp) {
        console.log(`no perms data found for ${rpName}`);
        return;
    }

    // get siblings to name node
    //document.querySelectorAll("button.explorer-lists__list__group__name__button")[2].parentNode.parentNode.querySelectorAll("div.explorer-lists__list__group__items")[0].querySelectorAll("div.explorer-lists__list__item")[0].innerText

    setTimeout(() => { // are you kidding me, we have to wait for children to load, sigh 😒
        var siblings = this.parentNode.parentNode.querySelectorAll("div.explorer-lists__list__group__items");
        var siblingNameNode = siblings[0].querySelectorAll("div.explorer-lists__list__item");
        siblingNameNode.forEach(el => {
            if (!el.innerText) { return; }
            var name = el.innerText;
            var query = `[].resourceTypes[].operations[?name=='${rpName}/${name}'].{name: name, description: description}[]`;
            var data = jmespath.search(permsData, query);
            console.log(data);
            if (data.length > 0) {
                //var tip = generateCKTooltip(data[0].description);
                el.innerText = `${el.innerText}: ${data[0].description}`;
            }
        });
    }, 500);
}

// could use the existing tooltips, although those are red and seemingly programmability
// is driven through a different mechanism than CSS, sadly
function generateCKTooltip(description) {
    const tip = document.createElement("div");
    tip.classList.add("explorer-lists__list__usage-tooltip");
    tip.setAttribute("role", "button");
    tip.setAttribute("tabindex", "0");
    tip.setAttribute("aria-label", description);
    tip.setAttribute("aria-haspopup", "true");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "17");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 17 16");
    svg.setAttribute("fill", "none");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute("d", "M8.50012 1C12.3661 1 15.5001 4.13401 15.5001 8C15.5001 11.866 12.3661 15 8.50012 15C4.63413 15 1.50012 11.866 1.50012 8C1.50012 4.13401 4.63413 1 8.50012 1ZM7.45012 4.51265C7.45012 4.80783 7.5522 5.05452 7.75637 5.25271C7.96054 5.4509 8.20845 5.55 8.50012 5.55C8.79179 5.55 9.0397 5.4509 9.24387 5.25271C9.44804 5.05452 9.55012 4.80783 9.55012 4.51265C9.55012 4.21747 9.44804 3.96657 9.24387 3.75994C9.0397 3.55331 8.79179 3.45 8.50012 3.45C8.20845 3.45 7.96054 3.55331 7.75637 3.75994C7.5522 3.96657 7.45012 4.21747 7.45012 4.51265ZM9.48012 11.22C9.48012 11.7612 9.04136 12.2 8.50012 12.2C7.95888 12.2 7.52012 11.7612 7.52012 11.22V7.57998C7.52012 7.03874 7.95888 6.59998 8.50012 6.59998C9.04136 6.59998 9.48012 7.03874 9.48012 7.57998V11.22Z");
    path.setAttribute("fill", "#FF644E");
    svg.appendChild(path);
    tip.appendChild(svg);
    return tip;
}

// <div class="explorer-lists__list__usage-tooltip" role="button" tabindex="0" 
//aria-label="None of the tasks in this group have been used in last 90 days." aria-haspopup="true">
//<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
//<path fill-rule="evenodd" clip-rule="evenodd" d="M8.50012 1C12.3661 1 15.5001 4.13401 15.5001 8C15.5001 11.866 12.3661 15 8.50012 15C4.63413 15 1.50012 11.866 1.50012 8C1.50012 4.13401 4.63413 1 8.50012 1ZM7.45012 4.51265C7.45012 4.80783 7.5522 5.05452 7.75637 5.25271C7.96054 5.4509 8.20845 5.55 8.50012 5.55C8.79179 5.55 9.0397 5.4509 9.24387 5.25271C9.44804 5.05452 9.55012 4.80783 9.55012 4.51265C9.55012 4.21747 9.44804 3.96657 9.24387 3.75994C9.0397 3.55331 8.79179 3.45 8.50012 3.45C8.20845 3.45 7.96054 3.55331 7.75637 3.75994C7.5522 3.96657 7.45012 4.21747 7.45012 4.51265ZM9.48012 11.22C9.48012 11.7612 9.04136 12.2 8.50012 12.2C7.95888 12.2 7.52012 11.7612 7.52012 11.22V7.57998C7.52012 7.03874 7.95888 6.59998 8.50012 6.59998C9.04136 6.59998 9.48012 7.03874 9.48012 7.57998V11.22Z" 
//fill="#FF644E"></path></svg></div>

function findResourceProviderInPermissionsData(resourceProvider) {
    return this.permsData.find(x => x.name === resourceProvider);
}

function connectObservers() {
    initRbac();
    console.log("connecting observers");
    // observer for the main page
    var observer = new MutationObserver(function (mutations, obs) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName !== "DIV" || node.nodeType !== 1) return;
                if (node.className.toLowerCase() === rowNodeClass.toLowerCase()) {
                    obs.disconnect();
                    attachClickEventsToToggleNodes();
                }
            });
        });
    });

    var config = { childList: true, subtree: true };
    console.log("observing body");
    observer.observe(document.body, config);
}

connectObservers();