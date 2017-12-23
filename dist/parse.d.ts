import { Token } from './tokenize';
export interface TextNode {
    type: 'text';
    text: string;
}
export interface TagNode {
    type: 'tag';
    tag: string;
    value: string;
    children: Node[];
}
export declare type Node = TextNode | TagNode;
export declare function parse(tokens: Token[]): Node[];
