export interface IAttrs {
  [k: string]: any;
}

export class VNode {
  constructor(
    public readonly nodeName: string,
    public readonly attrs: IAttrs,
    public readonly children: (VNode | string)[]
  ) {}
}

export function h(nodeName: string, props: IAttrs | null, ...children: any[]) {
  return new VNode(nodeName, props || {}, [...children]);
}
