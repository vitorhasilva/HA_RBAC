# Features

This Home Assistant RBAC Add-on provides a web interface controlling the [auth feature in Home Assistant](https://developers.home-assistant.io/docs/auth_permissions/).

You can create groups, drag and drop users inside (a user can belong to multiple groups), then configure devices and entities that each group is allowed to interact with.

## New in this version

- **Hierarchical permissions interface:**  
  Permissions are now managed in a single hierarchical list:  
  **Area → Device → Entity**.  
  Entities without area appear under "(No area)", and entities without device appear under "(No device)".
- **Unified permissions list:**  
  The previous "By device" tab and left column were removed. All permissions are managed in one place.
- **Search bar:**  
  A search box at the top allows filtering by area, device, or entity name, keeping the hierarchy visible for matching items.
- **Dropdowns for permissions:**  
  Each area, device, and entity has a dropdown to set permissions (Write, Read-only, Deny, Not specified).
- **Live policy update:**  
  Changing a dropdown updates the `policy.entities` JSON in the correct keys (`area_ids`, `device_ids`, `entity_ids`), including support for `__no_area__` and `__no_device__`.
- **User management preserved:**  
  All user/group management features (drag & drop, group creation, etc) remain available.

## Permissions

For each group, you can configure each area, device, and entity with the following permissions:
- Write: normal access without RBAC
- Read-only: a user can see a device but can't interact with it
- Deny: no access
- Not specified: fallback to default

The RBAC changes are API-proof.

The Add-on won't hide the history and the logbook tab.  
This isn't a problem for the history because users who don't have the permission to see the entities won't see anything.
However, for the logbook, users can't interact with devices but they can still see the logbook. That's why we recommend to include in your configuration the following code:

```yaml
logbook:
  exclude:
    entity_globs:
      - "*"
```
This will also exclude all entities from the logbook for admins.

# Limits

Despite that Home Assistant allows authorizations to go further, the project doesn't currently support the difference between controlling and editing a device.  
Now, this project supports configuring rights using `entity_ids`, `device_ids`, and `area_ids` in a hierarchical way.  
It still does **not** support `domains` or advanced merging policies.

This is still work in progress, most of these features are planned to be implemented in the future.

# Installation

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fvitorhasilva%2FHA_RBAC)

# License

Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg