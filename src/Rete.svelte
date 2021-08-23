<script lang="ts">
  import Rete from "rete";
  import ConnectionPlugin from "rete-connection-plugin";
  import { onMount } from "svelte";
  import ReteSvelteRenderPlugin, {
    ReteComponent,
    ReteControl,
  } from "./ReteSvelteRenderPlugin";

  export let appId = "svelte-rete@0.0.1";

  let container;

  onMount(async () => {
    const editor = new Rete.NodeEditor(appId, container);

    editor.use(ReteSvelteRenderPlugin);
    editor.use(ConnectionPlugin);

    const socket = new Rete.Socket("Socket");

    const components = [
      new ReteComponent(
        "Component",
        [
          {
            key: "inp1",
            displayName: "Input 1",
            socket,
            control: ReteControl,
            initialValue: "",
          },
        ],
        [{ key: "out1", displayName: "Output 1", socket }],
        ({ inp1 }) => {
          return { out1: inp1 };
        }
      ),
    ];

    const engine = new Rete.Engine(appId);
    components.forEach((component) => {
      editor.register(component);
      engine.register(component);
    });
    editor.on(
      "process nodecreated noderemoved connectioncreated connectionremoved",
      async () => {
        await engine.abort();
        await engine.process(editor.toJSON());
      }
    );

    editor.addNode(await components[0].createNode());
    editor.addNode(await components[0].createNode());
    editor.addNode(await components[0].createNode());
  });
</script>

<div class="rete" bind:this={container} />

<style>
  .rete {
    height: 100%;
  }
</style>
