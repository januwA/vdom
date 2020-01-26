import { h } from "./vnode";
import { createElement } from "./create-element";
import { diff, patch } from "./diff";

const app = document.querySelector<HTMLElement>(".app")!;
render(app);

function view() {
  return h("div", null, h("h1", null, "Title"));
}

function view2() {
  return h("div", null, h("h1", null, "Title"), h("p", null, "p"));
}

function render(root: HTMLElement) {
  const v = view();
  root.append(createElement(v));

  // 1秒后对比视图
  setTimeout(() => {
    const patches = diff({ newNode: view2(), oldNode: v });
    console.log(patches);
    patch(root, patches);
  }, 1000);
}
