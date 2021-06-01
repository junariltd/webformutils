///<amd-module name='jowebutils.querystring'/>

export function objectToQueryString(params: any) {
    if (!params) return '';
    return Object.keys(params).map((key) => {
        const value = params[key] !== null ? params[key] : '';
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }).join('&');
}

export function getQueryStringValue(param: string) {
    return getURLQueryStringValue(window.location.href, param);
}

export function getURLQueryStringValue(url: string, param: string) {
    return (new URL(url)).searchParams.get(param);
}

export function getAllQueryStringValues(){
    return (new URL(window.location.href)).searchParams;
}
