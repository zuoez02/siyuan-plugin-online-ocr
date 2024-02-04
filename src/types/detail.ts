export interface DetailBox {
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ParseDetail {
    parseDetail(raw: any): DetailBox[]
}