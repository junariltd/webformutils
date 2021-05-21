///<amd-module name='jowebutils.forms.utils'/>

export function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const res = reader.result as string;
            resolve(res.split(";base64,")[1]);
        }
        reader.onerror = error => reject(error);
    });
}
