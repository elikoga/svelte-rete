import type { SvelteComponent } from "svelte";
import type { Control, Node, NodeEditor, Socket } from "rete";
import Rete from "rete";
import NodeSvelteComponent from "./NodeComponent.svelte";
import JSONControlComponent from "./JSONControlComponent.svelte";
import type { NodeData, WorkerInputs, WorkerOutputs } from "rete/types/core/data";
import type { ComponentData } from "./types";

export class ReteControl extends Rete.Control {
  public props;
  public _svelte?: SvelteComponent;
  constructor(key: string, editor: NodeEditor, public component: typeof SvelteComponent = JSONControlComponent) {
    super(key);
    this.props = { key, editor };
  }
}

export class ReteComponent extends Rete.Component {
  public data: ComponentData;
  constructor(
    name: string,
    public inputs: {
      key: string;
      displayName: string;
      socket: Socket;
      initialValue: any;
      multiConns?: boolean;
      control?: typeof ReteControl;
    }[],
    public outputs: { key: string; displayName: string; socket: Socket; }[],
    public workerFunction: (
      input: Record<string, any>)
      => Record<string, any>,
    component: typeof SvelteComponent = NodeSvelteComponent) {
    super(name);
    this.data.component = component;
  }

  async builder(node: Node): Promise<void> {
    console.log("builder", node);
    this.inputs.forEach(({ key, displayName, socket, initialValue, multiConns, control }) => {
      const input = new Rete.Input(key, displayName, socket, multiConns);
      node.data[key] = initialValue;
      control && input.addControl(new control(key, this.editor));
      node.addInput(input);
    });
    this.outputs.forEach(({ key, displayName, socket }) => {
      node.addOutput(new Rete.Output(key, displayName, socket));
    });
  }
  worker(node: NodeData, inputs: WorkerInputs, outputs: WorkerOutputs, ...args: unknown[]): void {
    this.inputs.forEach(({ key, multiConns, control }) => {
      control && this.updateInputControlComponent(node, key, {
        ...(inputs[key].length && { value: multiConns ? inputs[key] : inputs[key][0] }),
        readonly: !!inputs[key].length,
      });
      if (inputs[key].length) {
        node.data[key] = multiConns ? inputs[key] : inputs[key][0];
      }
    });


    Object.assign(outputs, this.workerFunction(node.data));

    console.log("worker", { node, inputs, outputs });
    console.log("result", { result: this.workerFunction(node.data), data: node.data });
  }

  public updateInputControlComponent(nodeData: NodeData, inputKey: string, props) {
    let control = this.editor.nodes
      .find((n) => n.id == nodeData.id)
      .inputs.get(inputKey)
      .control;
    if (!(control instanceof ReteControl)) throw control;
    control._svelte.$$set(props);
    console.log("control", { control, props });
  }
}

const install = (editor: NodeEditor, options) => {
  console.log("install", { editor, options });
  const InstallNodeComponent: typeof SvelteComponent = options.component ?? NodeSvelteComponent;
  editor.on("rendernode", rendernode => {
    console.log("rendernode", rendernode);
    const NodeComponent: typeof SvelteComponent = ((rendernode.component as ComponentData).component ?? InstallNodeComponent);
    if ((NodeComponent as any).render && (NodeComponent as any).render !== "svelte") return;
    (rendernode.node as Node & { _svelte: SvelteComponent; })._svelte = new NodeComponent({ target: rendernode.el, props: rendernode });
  });
  editor.on("rendercontrol", rendercontrol => {
    console.log("rendercontrol", rendercontrol);
    if (rendercontrol.control && (rendercontrol.control as any).render && (rendercontrol.control as any).render !== 'svelte') return;
    const control = rendercontrol.control as ReteControl;
    control._svelte = new control.component({ target: rendercontrol.el, props: { ...control.props, ...rendercontrol } });
  });
  let selectedNode = null;
  editor.on("nodeselected", (nodeselected: Node & { _svelte: SvelteComponent; }) => {
    console.log("nodeselected", nodeselected);
    if (selectedNode !== nodeselected) selectedNode?._svelte.$$set({ selected: false });
    nodeselected._svelte.$$set({ selected: true });
    selectedNode = nodeselected;
  });
};

export default {
  name: 'ReteSvelteRenderPlugin',
  install: install
};