import { Node } from 'unist';

interface ParagraphNode extends Node {
  type: 'paragraph';
  data?: {
    hProperties?: {
      className?: string;
    };
  };
}

interface Root extends Node {
  children?: Node[]; // 将 children 改为可选属性
}

const remarkAddClassNameToLastNode = (className: string) => {
    return (tree: Root) => {
      if (!tree || !tree.children || tree.children.length === 0) {
        return;
      }
  
      const lastNode = tree.children[tree.children.length - 1] as ParagraphNode;
  
      if (lastNode && lastNode.type === 'paragraph') {
        lastNode.data = lastNode.data || {};
        lastNode.data.hProperties = lastNode.data.hProperties || {};
        lastNode.data.hProperties.className = className;
      }
    };
  };

export default remarkAddClassNameToLastNode;