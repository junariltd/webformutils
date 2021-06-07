///<amd-module name='jowebutils.utils'/>

// Returns the current URL starting from the first "/"
export function getCurrentUrlWithoutHost() {
    return location.pathname + location.search + location.hash;
}

// OWL Monkey-patching functions (in Odoo 14+ these are built in to the framework)
// From https://github.com/odoo/owl/pull/314/commits/46095b7a967e75ee20a87cac018c540ace1f8447

const patchMap = new WeakMap();
export function patch(C: any, patchName: string, patch: any) {
    let metadata = patchMap.get(C.prototype);
    if (!metadata) {
        metadata = {
            origMethods: {},
            patches: {},
            current: []
        };
        patchMap.set(C.prototype, metadata);
    }
    const proto = C.prototype;
    if (metadata.patches[patchName]) {
        throw new Error(`Patch [\${patchName}] already exists`);
    }
    metadata.patches[patchName] = patch;
    applyPatch(proto, patch);
    metadata.current.push(patchName);
    function applyPatch(proto: any, patch: any) {
        Object.keys(patch).forEach(function (methodName) {
            const method = patch[methodName];
            if (typeof method === "function") {
                const original = proto[methodName];
                if (!(methodName in metadata.origMethods)) {
                    metadata.origMethods[methodName] = original;
                }
                proto[methodName] = function (...args: any[]) {
                    this._super = original;
                    return method.call(this, ...args);
                };
            }
        });
    }
}

// we define here an unpatch function.  This is mostly useful if we want to
// remove a patch.  For example, for testing purposes
export function unpatch(C: any, patchName: string) {
    const proto = C.prototype;
    let metadata = patchMap.get(proto);
    if (!metadata) {
        return;
    }
    patchMap.delete(proto);
    // reset to original
    for (let k in metadata.origMethods) {
        proto[k] = metadata.origMethods[k];
    }
    // apply other patches
    for (let name of metadata.current) {
        if (name !== patchName) {
            patch(C, name, metadata.patches[name]);
        }
    }
}