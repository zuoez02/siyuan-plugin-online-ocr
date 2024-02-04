export async function sleep(t: number) {
    return new Promise((resolve) => setTimeout(resolve, t));
}

export class ExtendedArray<T> extends Array<T> {
    listeners: { [key: string]: Array<any> } = {};

    on(event: string, callback: (...args: any) => any) {
        this.listeners[event] = !this.listeners[event] ? [callback] : [...this.listeners[event], callback];
    }

    off(event: string, callback: (...args: any) => any) {
        if (!this.listeners[event]) {
            return;
        }
        const i = this.listeners[event].findIndex((v) => v === callback);
        if (i >= 0) {
            this.listeners[event].splice(i, 1);
        }
    }

    dispatch(eventName: string, ...value: any) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach((c) => c(value));
        }
    }
}

export async function getImageSizeFromBlob(image: Blob | string): Promise<{ width: number, height: number }> {
    return new Promise((resolve) => {
        const img = new Image();
        let url;
        if (image instanceof Blob) {
            url = URL.createObjectURL(image);
        } else {
            url = image;
        }
        img.src = url;
        img.onload = function () {
            // 获取图像的宽度和高度  
            const width = img.width;
            const height = img.height;
            resolve({ width, height })

            // 使用宽度和高度进行后续操作
            // 清理 URL 对象
            URL.revokeObjectURL(url)
        };
    })
}