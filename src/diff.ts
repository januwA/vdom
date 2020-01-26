import { VNode } from "./vnode";
import { createElement } from "./create-element";

export const CREATE = "CREATE"; //新增一个节点
export const REMOVE = "REMOVE"; //删除原节点
export const REPLACE = "REPLACE"; //替换原节点
export const UPDATE = "UPDATE"; //检查属性或子节点是否有变化
export const SET_PROP = "SET_PROP"; //新增或替换属性
export const REMOVE_PROP = "REMOVE PROP"; //删除属性

export interface IAttrPatches {
  type: string;
  key: string;
  value: any;
}

export interface IPatches {
  type: string;
  newNode?: TVNode;
  attrs?: IAttrPatches[];
  children?: TDiffResult[];
}

type TDiffResult = IPatches | undefined;
type TVNode = VNode | string;

export function diff({
  newNode,
  oldNode
}: {
  newNode: TVNode;
  oldNode: TVNode;
}): TDiffResult {
  if (!oldNode) {
    return { type: CREATE, newNode };
  }
  if (!newNode) {
    return { type: REMOVE };
  }
  if (changed(newNode, oldNode)) {
    return { type: REPLACE, newNode };
  }

  if (newNode instanceof VNode && oldNode instanceof VNode) {
    return {
      type: UPDATE,
      attrs: diffProps(newNode, oldNode),
      children: diffChildren(newNode, oldNode)
    };
  }
}

/**
 * 检查vdom是否有变动
 * @param node1
 * @param node2
 */
function changed(node1: TVNode, node2: TVNode): boolean {
  let isChanged = false;

  // 类型不一样肯定改变了
  if (typeof node1 !== typeof node2) {
    isChanged = true;
  }

  // 当为string时判断是否相等即可
  if (!isChanged && typeof node1 === "string" && typeof node2 === "string") {
    isChanged = node1 !== node2;
  }

  // 当为vnode时，判断nodeName是否相同即可
  if (!isChanged && node1 instanceof VNode && node2 instanceof VNode) {
    isChanged = node1.nodeName !== node2.nodeName;
  }

  return isChanged;
}

/**
 * 比较vdom的属性变化
 * @param newNode
 * @param oldNode
 */
function diffProps(newNode: VNode, oldNode: VNode): IAttrPatches[] {
  const patches: IAttrPatches[] = [];
  const attrs = Object.assign({}, newNode.attrs, oldNode.attrs);
  Object.keys(attrs).forEach(key => {
    const newVal = newNode.attrs[key];
    const oldVal = oldNode.attrs[key];
    if (!newVal) {
      patches.push({ type: REMOVE_PROP, key, value: oldVal });
    } else if (!oldVal || newVal !== oldVal) {
      patches.push({ type: SET_PROP, key, value: newVal });
    }
  });
  return patches;
}

function diffChildren(newNode: VNode, oldNode: VNode): TDiffResult[] {
  const patches: TDiffResult[] = [];
  const maximumLength = Math.max(
    newNode.children.length,
    oldNode.children.length
  );
  for (let i = 0; i < maximumLength; i++) {
    patches[i] = diff({
      newNode: newNode.children[i],
      oldNode: oldNode.children[i]
    });
  }
  return patches;
}

export function patch(parent: HTMLElement, patches: TDiffResult, index = 0) {
  if (!patches) {
    return;
  }
  const el = parent.childNodes[index];
  switch (patches.type) {
    case CREATE:
      if (patches.newNode) {
        const newEl = createElement(patches.newNode);
        parent.appendChild(newEl);
      }
      break;
    case REMOVE:
      parent.removeChild(el);
      break;
    case REPLACE:
      if (patches.newNode) {
        const newEl = createElement(patches.newNode);
        return parent.replaceChild(newEl, el);
      }
      break;
    case UPDATE:
      if (patches.attrs && patches.attrs.length) {
        patchProps(el as HTMLElement, patches.attrs);
      }
      if (patches.children && patches.children.length) {
        for (let i = 0; i < patches.children.length; i++) {
          patch(el as HTMLElement, patches.children[i], i);
        }
      }
  }
}

function patchProps(node: HTMLElement, patches: IAttrPatches[]) {
  patches.forEach(patch => {
    const { type, key, value } = patch;
    if (type === SET_PROP) {
      node.setAttribute(key, value);
    }
    if (type === REMOVE_PROP) {
      node.removeAttribute(key);
    }
  });
}
