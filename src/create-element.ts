import { VNode } from "./vnode";

export function createElement(vnode: VNode | string) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }
  const { nodeName, attrs, children } = vnode;
  const el = document.createElement(nodeName);

  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));

  children.map(createElement).forEach(node => el.appendChild(node));
  return el;
}
