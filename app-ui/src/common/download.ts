import { Axios as axios } from 'axios-observable';

export function download(
    filePath: string,
    category: 'docs' | 'forms' | 'output',
    fileExtension?: string,
    outputFileName: string = 'downloaded-file',
    successHandler?: () => void,
    errorHandler?: (error: any) => void,
) {
    const fullEndPoint = `/resources/info/download/${filePath}`;
    axios
        .get(fullEndPoint, {
            responseType: 'blob',
            params: { category, fileExtension },
        })
        .subscribe({
            next: (response) => {
                const blob = new Blob([response.data]);
                const link = document.createElement('a');
                link.href = globalThis.URL.createObjectURL(blob);
                link.setAttribute('download', `${outputFileName}.${fileExtension}`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                globalThis.URL.revokeObjectURL(link.href);
                successHandler?.();
            },
            error: errorHandler,
        });
}
