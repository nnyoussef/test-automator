import { Axios as axios } from 'axios-observable';
import type { AxiosError } from 'axios';

export function download(
    filePath: string,
    category: 'docs' | 'forms' | 'output',
    fileExtension?: string,
    outputFileName: string = 'downloaded-file',
    handlers?: {
        successHandler?: () => void;
        errorHandler?: (error: AxiosError) => void;
    },
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
                handlers?.successHandler?.();
            },
            error: handlers?.errorHandler,
        });
}
