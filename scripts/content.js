// v0.1.0 EPM help overlay

// static help overlay
const elementData = [
    {
        selector: "[href='/data-sources/data-collectors/']",
        content: "Start here to connect environments to EPM"
    }
];

function generateHelper() {
    console.log("Generating helper");
    // generate the visual clippy in the bottom right
    const clippyStyle = document.createElement("style");
    // add the CSS as a string using template literals
    clippyStyle.appendChild(document.createTextNode(`
        .helper-container {
            position: absolute;
            bottom: 50px;
            right: 50px;
            z-index: 9999;
        }
        .helper-container img {
            max-width: 15em;
        }`
    ));
    const head = document.getElementsByTagName('head')[0];
    head.appendChild(clippyStyle);
    console.log("finished adding helper style, adding container");

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

function generateInfoBox() {

}

async function findAttachableItems() {
    elementData.forEach(async (element) => {
        const elements = document.querySelectorAll(element.selector);
        if (elements.length === 0) {
            console.log(`no elements found for ${element.selector}, retrying in 5 seconds`);
            // hacky, but retry in 5 seconds if there are no elements - since no elements means it likely hasn't loaded yet
            // or you have bad selectors - exponential backoff would be better
            setTimeout(findAttachableItems, 5000);
            return;
        }
        console.log(`found ${elements.length} elements`);

        elements.forEach((el) => {
            el.addEventListener("hover", () => { console.log(`hovering over ${el.nodeValue}`); });
            el.style.backgroundColor = 'yellow';
        });
    });
}

function init() {
    generateHelper();
    generateInfoBox();
    findAttachableItems();
}

// need to find an event for both the page load and the react app load completion\
// this is a hacky way to do it
setTimeout(init, 5000);