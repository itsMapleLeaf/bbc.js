export interface OpenTagToken {
    type: 'open-tag';
    text: string;
    tag: string;
    value: string;
}
export interface CloseTagToken {
    type: 'close-tag';
    text: string;
    tag: string;
}
export interface TextToken {
    type: 'text';
    text: string;
}
export declare type Token = OpenTagToken | CloseTagToken | TextToken;
export declare function tokenize(bbcString: string): Token[];
