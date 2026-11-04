# Azure Deployment Plan

Status: Validated

## Objective

Configure the application to use live Wego API credentials securely and verify that the required cloud storage is available.

## Workspace

- Mode: MODIFY - add Azure runtime support to the restored planner
- Repository: linked-jobs-route-planner
- Application stack: Static Vercel frontend with serverless WeGo proxy and future Azure secret/storage bindings

## Requirements

- Wego API product/base URL and live credential mechanism: Historical WeGo GTFS-Realtime proxy found; it uses public feeds and no API key
- Azure subscription and region: Azure for Students (`554e9517-20ce-4cb1-b8bf-3eff93148d74`), tenant `dc2273e5-b77e-4b19-ae61-f4b69fb7609c`, East US
- Cloud storage account/container: Create a private storage account and `planner-assets` blob container
- Authentication/sign-in flow: To be inspected

## Proposed approach

- Keep live credentials out of source control and client-side bundles.
- Use the repository's existing configuration pattern where possible.
- Use Azure-managed secret/configuration storage for deployment credentials.
- Verify storage reachability and permissions with a non-destructive check.

## Approved architecture

- Resource group: `linked-jobs-planner-rg`
- Storage account: globally unique planner storage account name
- Blob container: `planner-assets`, private access
- Key Vault: globally unique planner vault name
- Secret references: metadata only until official provider credentials are supplied
- Existing Vercel deployment remains the public frontend

## Recipe

- Type: Bicep
- Template: `infra/main.bicep`
- Resource group: `linked-jobs-planner-rg`
- Resource region: `eastus` (required by the subscription's allowed-region policy)

## Execution status

- [x] Analyze workspace
- [x] Confirm requirements
- [x] Scan codebase
- [x] Select Azure recipe
- [x] Finalize architecture
- [x] Obtain user approval
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
- `az bicep build --file infra/main.bicep`: passed.
- Subscription policy inspection: resources must use one of `eastus`, `canadacentral`, `mexicocentral`, `westus2`, or `centralus`; deployment uses `eastus`.
- `az deployment group what-if`: succeeded with the expected StorageV2 account, private container, Key Vault, managed identity, and Key Vault Secrets Officer role assignment.
- `az deployment group create`: succeeded.
- WeGo live integration uses official public GTFS-Realtime feeds; no Wego API key is required.
- Provider job integrations are safe intake/connection surfaces and require official provider authorization.

## Validation Steps

- Build the Bicep template.
- Check subscription policy and region availability.
- Run deployment what-if.
- Review storage, Key Vault, identity, and role-assignment configuration.
- Deploy incrementally and verify the resulting resources.

## Azure inventory

The Azure CLI sees the Azure for Students subscription through `kyle.taylor1@students.post.edu`. The subscription was empty before provisioning; the planner resource group, storage account, blob container, Key Vault, and managed identity are now provisioned and listed below.

## Validation Proof

- `az account show`: Azure for Students subscription `554e9517-20ce-4cb1-b8bf-3eff93148d74`
- `az group list`: no existing resource groups before provisioning
- Subscription policy allows `eastus`, `canadacentral`, `mexicocentral`, `westus2`, and `centralus`; resources use `eastus`.
- `az storage account list`: no existing storage accounts before provisioning
- `az keyvault list`: no existing Key Vaults before provisioning
- `npm.cmd test`: 63 tests passed

## Provisioned resources

- Resource group: `linked-jobs-planner-rg`
- Storage account: `azstjo7dqd7g3o6vi`
- Blob container: `planner-assets` (private)
- Key Vault: `azkvjo7dqd7g3o6vi`
- Managed identity: `azidjo7dqd7g3o6vi`
- Key Vault RBAC: `Key Vault Secrets Officer` assigned to the managed identity
