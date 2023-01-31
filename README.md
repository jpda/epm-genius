# epm-genius

Submission for the Microsoft Entra Permissions Management hackathon, January 2023. This is a chrome extension that had lofty goals and delivered on one of them. In the spirit of Top Gear, ambitious but rubbish. 

## What it does

Originally intended to offer onboarding guidance via tooltips, `content.js` injects a 'helper' character and uses an array of elements + content to display tooltips near the element to show on hover. 

- Tooltips statically defined in `overlayData` array, could come from an API in future
- Tooltips are quite ugly, could use a designer's touch

## Describing permissions

On the `analytics` page, the extension appends more information about each permission in the permissions list using the resource provider data from the Azure REST API.

This uses static data today, shipped with the extension. It is fairly large (around 6MB) so caching is important, but it is not evergreen - new resource providers & operations come online frequently. 

## Stuff it _could_ do

- Use the Azure REST API to get the latest resource provider data
- Build walkthroughs
- Crowdsource tooltip/guidance data
- All sorts of fun stuff

## Stuff that should be sorted for scale

- Switch to `observers` for activation/data loaded instead of timeouts (since timeouts are not guaranteed)
- - initial loading in `content.js`
- - subtree loading in `rbac-info.js`
- Evaluate many small queries vs. fewer but larger payloads