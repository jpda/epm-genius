// v0.1.0 EPM help overlay

// static help overlay
const overlayData = [
    {
        selector: "[href='/data-sources/data-collectors/']",
        content: "Connect environments to EPM",
        tooltipDirection: "bottom"
    },
    {
        selector: "[aria-label='Create Configuration']",
        content: "Configure your Data Collectors",
        tooltipDirection: "right"
    }
];

function generateHelper() {
    console.log("Generating helper");
    // generate the visual clippy in the bottom right

    const clippy = document.createElement("div");
    clippy.classList.add("clippy");
    console.log("getting helper image url");
    var helperImageUrl = chrome.runtime.getURL("images/clip.webp");
    console.log(helperImageUrl);
    clippy.innerHTML = `<div class="helper-container">
        <img src="${helperImageUrl}" alt="helper">
    </div>`;
    document.body.appendChild(clippy);

}

function generateInfoBox(foundElement, targetElementData) {
    const infoBox = document.createElement("div");
    infoBox.classList.add("epmg-tooltip");

    const container = document.createElement("div");
    container.classList.add("epmg-tooltipcontainer");
    container.classList.add(`${targetElementData.tooltipDirection}`);
    container.innerHTML = `<span class="epmg-tooltiptext">${targetElementData.content}</span>`;

    infoBox.appendChild(container);
    foundElement.appendChild(infoBox);
    foundElement.classList.add("epmg-tooltip");
}

async function findAttachableItems(attempts, timeoutId) {
    if (!attempts) attempts = 0;
    if (attempts > 3) { console.log("too many attempts, ending"); clearTimeout(timeoutId); return; }

    overlayData.forEach(async (targetElementData) => {
        const targetElements = document.querySelectorAll(targetElementData.selector);
        if (targetElements.length === 0) {

            // hacky, but retry in 5 seconds if there are no elements - since no elements means it likely hasn't loaded yet
            // or you have bad selectors - exponential backoff would be better
            attempts++;
            var nextTimeout = attempts * 5000;

            console.log(`no elements found for ${targetElementData.selector}, retrying in ${nextTimeout / 1000} seconds`);
            var timeoutId = setTimeout(function () { findAttachableItems(attempts); }, nextTimeout, timeoutId);
            return;
        }
        console.log(`found ${targetElements.length} elements`);

        targetElements.forEach((foundElement) => {
            console.log(`generating infobox for ${foundElement.nodeValue}`);
            generateInfoBox(foundElement, targetElementData);
        });
    });
}

function init() {
    generateHelper();
    findAttachableItems(0, 0);
    //initRbacData();
}

// need to find an event for both the page load and the react app load completion\
// this is a hacky way to do it
setTimeout(init, 5000);

