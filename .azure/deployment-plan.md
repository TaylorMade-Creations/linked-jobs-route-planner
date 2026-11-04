# Azure Deployment Plan

Status: Draft - Azure subscription available

## Objective

Configure the application to use live Wego API credentials securely and verify that the required cloud storage is available.

## Workspace

- Mode: To be determined
- Repository: linked-jobs-route-planner
- Application stack: To be determined

## Requirements

- Wego API product/base URL and live credential mechanism: Historical WeGo GTFS-Realtime proxy found; it uses public feeds and no API key
- Azure subscription and region: Azure for Students (`554e9517-20ce-4cb1-b8bf-3eff93148d74`), tenant `dc2273e5-b77e-4b19-ae61-f4b69fb7609c`; no region selected
- Cloud storage account/container: To be discovered or created after approval
- Authentication/sign-in flow: To be inspected

## Proposed approach

- Keep live credentials out of source control and client-side bundles.
- Use the repository's existing configuration pattern where possible.
- Use Azure-managed secret/configuration storage for deployment credentials.
- Verify storage reachability and permissions with a non-destructive check.

## Execution status

- [ ] Analyze workspace
- [ ] Confirm requirements
- [ ] Scan codebase
- [ ] Select Azure recipe
- [ ] Finalize architecture
- [ ] Obtain user approval
- [ ] Generate or update configuration
- [x] Generate or update configuration
- [x] Validate

## Discovery

The prior planner implementation exists in Git history, including:

- `nashville-live-planner/api/wego-live.js` at commit `be8e625` / `5b3bcee`
- `nashville-live-planner/provider-connectors.js`
- `nashville-live-planner/work-app-backbone.js`
- `nashville-live-planner/route-planner-core.js`
- `frontend/app.js`

The historical README describes the requested status colors and route behavior. The WeGo integration proxies official GTFS-Realtime feeds and does not contain a Wego API key. The historical planner uses Leaflet/OpenStreetMap, so it also does not require a Google Maps browser key for its map.

## Validation

- Restored source from commit `5b3bcee`.
- `npm.cmd test`: 63 tests passed.
- WeGo live integration uses official public GTFS-Realtime feeds; no Wego API key is required.
- Provider job integrations are safe intake/connection surfaces and require official provider authorization.

## Azure inventory

The Azure CLI now sees the Azure for Students subscription through `kyle.taylor1@students.post.edu`. The subscription currently has no listed resource groups, storage accounts, or Key Vaults, so there is no existing Azure storage or vault binding to verify yet.

## Blocking issue

The previously signed-in `kyle.taylor133@hotmail.com` tenant had no subscription. The newly visible Azure for Students subscription is available, but creating a resource group, storage account, or Key Vault requires the deployment plan to be finalized and approved first.
