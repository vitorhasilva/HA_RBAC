function buttonClass(permission) {
    switch (permission) {
        case "write":
            return "btn-success";
        case "read only":
            return "btn-warning";
        case "deny":
            return "btn-danger";
        default:
            return "btn-secondary";
    }
}

function buttonIcon(permission) {
    switch (permission) {
        case "write":
            return "bi-check-circle";
        case "read only":
            return "bi-eye";
        case "deny":
            return "bi-ban";
        default:
            return "bi-question-circle";
    }
}

function parsePermission(value) {
    if (value === true) return "write";
    if (value === false) return "deny";
    if (value && value.read) return "read only";
    return "not specified";
}

function getCurrentPermission(type, id) {
    const policy = Group.getOpened()?.policy?.entities || {};
    if (type === "area") return parsePermission(policy.area_ids?.[id]);
    if (type === "device") return parsePermission(policy.device_ids?.[id]);
    if (type === "entity") return parsePermission(policy.entity_ids?.[id]);
    return "not specified";
}

function setPermission(type, id, permission) {
    const group = auth.data.groups.find(g => g.id == Group.getOpened().id);
    if (!group.policy) group.policy = {};
    if (!group.policy.entities) group.policy.entities = {};
    const entities = group.policy.entities;
    let mapName;
    if (type === "area") mapName = "area_ids";
    else if (type === "device") mapName = "device_ids";
    else mapName = "entity_ids";
    if (!entities[mapName]) entities[mapName] = {};
    switch (permission) {
        case "write":
            entities[mapName][id] = true;
            break;
        case "read only":
            entities[mapName][id] = { read: true };
            break;
        case "deny":
            entities[mapName][id] = false;
            break;
        default:
            delete entities[mapName][id];
    }
}

function createDropdown(type, id, current) {
    const drop = $("<div>").addClass("dropdown");
    const btn = $("<button>")
        .addClass(`btn ${buttonClass(current)} dropdown-toggle`)
        .attr("type", "button")
        .attr("data-bs-toggle", "dropdown")
        .attr("aria-expanded", "false")
        .append($("<i>").addClass(buttonIcon(current)));
    const menu = $("<ul>").addClass("dropdown-menu");
    ["not specified", "deny", "read only", "write"].forEach(p => {
        const item = $("<li>").append(
            $("<a>").addClass("dropdown-item").attr("href", "#").attr("data-permission", p).text(p)
        );
        menu.append(item);
    });
    drop.append(btn).append(menu);
    drop.on("click", ".dropdown-item", function (e) {
        e.preventDefault();
        const perm = $(this).data("permission");
        setPermission(type, id, perm);
        btn.removeClass("btn-secondary btn-danger btn-warning btn-success").addClass(buttonClass(perm));
        btn.children().first().removeClass("bi-question-circle bi-ban bi-eye bi-check-circle").addClass(buttonIcon(perm));
    });
    return drop;
}

function buildTreeData() {
    const tree = {};
    const areaMap = {};

    rbac.files.area_registry?.data?.areas?.forEach(a => {
        areaMap[a.id] = a.name || a.id;
        tree[a.id] = { name: areaMap[a.id], devices: {} };
    });
    tree["__no_area__"] = { name: "(No area)", devices: {} };

    const deviceMap = {};
    rbac.files.device_registry.data.devices.forEach(d => {
        const name = d.name_by_user || d.name || d.id;
        const areaId = d.area_id || "__no_area__";
        deviceMap[d.id] = { name, area_id: areaId };
        if (!tree[areaId]) tree[areaId] = { name: areaMap[areaId] || areaId, devices: {} };
        tree[areaId].devices[d.id] = { name, entities: [] };
    });

    rbac.files.entity_registry.data.entities.forEach(ent => {
        const deviceId = ent.device_id || "__no_device__";
        let areaId = ent.area_id;
        if (!areaId && deviceId !== "__no_device__") {
            areaId = deviceMap[deviceId]?.area_id;
        }
        areaId = areaId || "__no_area__";

        if (!tree[areaId]) {
            tree[areaId] = { name: areaMap[areaId] || "(No area)", devices: {} };
        }
        if (!tree[areaId].devices[deviceId]) {
            const dName = deviceId === "__no_device__" ? "(No device)" : (deviceMap[deviceId]?.name || deviceId);
            tree[areaId].devices[deviceId] = { name: dName, entities: [] };
        }

        tree[areaId].devices[deviceId].entities.push({
            id: ent.entity_id,
            name: ent.original_name || ent.name || ent.entity_id
        });
    });

    return tree;
}

function renderPermissionTree() {
    const container = $("#permission_tree");
    container.empty();
    const searchLi = $("<li>").addClass("list-group-item").append(
        $("<input>").attr({ type: "text", placeholder: "Search", id: "permission_search" }).addClass("form-control").css({ border: "none", padding: 0 })
    );
    container.append(searchLi);

    const tree = buildTreeData();
    Object.entries(tree).forEach(([areaId, areaNode]) => {
        const areaLi = $("<li>").addClass("list-group-item").attr("data-area-id", areaId);
        const aHeader = $("<div>").addClass("d-flex justify-content-between align-items-center");
        $("<span>").addClass("toggle-fold").text(areaNode.name).appendTo(aHeader);
        aHeader.append(createDropdown("area", areaId, getCurrentPermission("area", areaId)));
        areaLi.append(aHeader);
        const devicesUl = $("<ul>").addClass("list-group collapse");
        Object.entries(areaNode.devices).forEach(([deviceId, deviceNode]) => {
            const deviceLi = $("<li>").addClass("list-group-item").attr("data-device-id", deviceId);
            const dHeader = $("<div>").addClass("d-flex justify-content-between align-items-center");
            $("<span>").addClass("toggle-fold").text(deviceNode.name).appendTo(dHeader);
            dHeader.append(createDropdown("device", deviceId, getCurrentPermission("device", deviceId)));
            deviceLi.append(dHeader);
            const entitiesUl = $("<ul>").addClass("list-group collapse");
            deviceNode.entities.forEach(en => {
                const entityLi = $("<li>").addClass("list-group-item").attr("data-entity-id", en.id);
                const eHeader = $("<div>").addClass("d-flex justify-content-between align-items-center");
                $("<span>").text(en.name).appendTo(eHeader);
                eHeader.append(createDropdown("entity", en.id, getCurrentPermission("entity", en.id)));
                entityLi.append(eHeader);
                entitiesUl.append(entityLi);
            });
            deviceLi.append(entitiesUl);
            devicesUl.append(deviceLi);
        });
        areaLi.append(devicesUl);
        container.append(areaLi);
    });

    container.on("click", ".toggle-fold", function () {
        $(this).closest("div").next(".collapse").collapse("toggle");
    });

    $("#permission_search").on("input", function () {
        const q = $(this).val().toLowerCase();
        filterTree(q);
    });
}

function filterTree(query) {
    const items = $("#permission_tree").find("li[data-area-id],li[data-device-id],li[data-entity-id]");
    if (!query) {
        items.show();
        $("#permission_tree ul.collapse").collapse("hide");
        return;
    }
    items.each(function () {
        const text = $(this).children("div").first().text().toLowerCase();
        if (text.includes(query)) {
            $(this).show();
            $(this).parents("li").show();
            $(this).parents("ul.collapse").collapse("show");
        } else {
            $(this).hide();
        }
    });
}

// Override original method
const originalOpenRights = Group.prototype.open_rights;
Group.prototype.open_rights = function () {
    $("#modal_rights_configuration .modal-title").html(`<strong>${this.name}</strong> configuration`);
    $("#modal_rights_configuration").modal("show");
    $("#modal_rights_configuration").attr("data-group-id", this.id);
    renderPermissionTree();
};
