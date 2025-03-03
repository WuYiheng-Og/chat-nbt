import { Node } from 'unist';
import { describe, expect, it } from 'vitest';
import remarkAddClassNameToLastNode from './remarkAddClassNameToLastNode'; // 替换为实际的文件名

interface ParagraphNode extends Node {
    type: 'paragraph';
    data?: {
        hProperties?: {
            className?: string;
        };
    };
}

interface Root extends Node {
    children?: Node[];
}

describe('remarkAddClassNameToLastNode', () => {
    it('should do nothing if the tree is empty', () => {
        const className = 'test-class';
        const tree: Root = {};
        const originalTree = { ...tree };

        const transformer = remarkAddClassNameToLastNode(className);
        transformer(tree);

        expect(tree).toEqual(originalTree);
    });

    it('should do nothing if the tree has no children', () => {
        const className = 'test-class';
        const tree: Root = { type: 'root' };
        const originalTree = { ...tree };

        const transformer = remarkAddClassNameToLastNode(className);
        transformer(tree);

        expect(tree).toEqual(originalTree);
    });

    it('should add className to the last paragraph node', () => {
        const className = 'test-class';
        const tree: Root = {
            type: 'root',
            children: [
                { type: 'other' },
                { type: 'paragraph' } as ParagraphNode
            ]
        };

        const transformer = remarkAddClassNameToLastNode(className);
        transformer(tree);

        const lastNode = tree.children![tree.children!.length - 1] as ParagraphNode;
        expect(lastNode.data?.hProperties?.className).toBe(className);
    });

    it('should add className to the last paragraph node even if it already has data', () => {
        const className = 'test-class';
        const tree: Root = {
            type: 'root',
            children: [
                { type: 'other' },
                {
                    type: 'paragraph',
                    data: {
                        hProperties: {
                            otherProp: 'value'
                        }
                    }
                } as ParagraphNode
            ]
        };

        const transformer = remarkAddClassNameToLastNode(className);
        transformer(tree);

        const lastNode = tree.children![tree.children!.length - 1] as ParagraphNode;
        expect(lastNode.data?.hProperties?.className).toBe(className);
        expect(lastNode.data?.hProperties?.otherProp).toBe('value');
    });

    it('should do nothing if the last node is not a paragraph', () => {
        const className = 'test-class';
        const tree: Root = {
            type: 'root',
            children: [
                { type: 'paragraph' } as ParagraphNode,
                { type: 'other' }
            ]
        };
        const originalTree = { ...tree };

        const transformer = remarkAddClassNameToLastNode(className);
        transformer(tree);

        expect(tree).toEqual(originalTree);
    });
});