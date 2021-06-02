///<amd-module name='jowebutils.utils'/>

// Returns the current URL starting from the first "/"
export function getCurrentUrlWithoutHost() {
    return location.pathname + location.search + location.hash;
}
