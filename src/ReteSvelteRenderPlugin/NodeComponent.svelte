<script lang="ts">
  import type { Node } from "rete";
  import type { ComponentData } from "./types";
  import Socket from "./SocketComponent.svelte";
  import Control from "./ControlComponent.svelte";
  import { onMount, SvelteComponent } from "svelte";
  export let selected: boolean = false;
  export let node: Node & { _svelte: SvelteComponent };
  export let bindSocket: Function;
  export let bindControl: Function;
  export let el;
  export let component: ComponentData;

  const kebap = (str) => {
    const replace = (s) => s.toLowerCase().replace(/ /g, "-");

    return Array.isArray(str) ? str.map(replace) : replace(str);
  };
</script>

<div class="node {selected ? 'selected' : ''} {kebap(node.name)}">
  <div class="title">{node.name}</div>
  <!-- Outputs-->
  {#each [...node.outputs] as [key, output]}
    <div class="output">
      <div class="output-title">{output.name}</div>
      <Socket {bindSocket} socket={output.socket} io={output} type="output" />
    </div>
  {/each}
  <!-- Controls-->
  {#each [...node.controls] as [key, control]}
    <Control cssClass="control" {bindControl} {control} />
  {/each}
  <!-- Inputs-->
  {#each [...node.inputs] as [key, input]}
    <div class="input">
      <Socket {bindSocket} socket={input.socket} io={input} type="input" />
      {#if input.showControl()}
        <Control
          cssClass="input-control"
          {bindControl}
          control={input.control}
        />
      {:else}
        <div class="input-title" v-show="!input.showControl()">
          {input.name}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  @import "./vars";
  .node {
    background: $node-color;
    border: 2px solid #4e58bf;
    border-radius: 10px;
    cursor: pointer;
    min-width: $node-width;
    height: auto;
    padding-bottom: 6px;
    box-sizing: content-box;
    position: relative;
    user-select: none;
    &:hover {
      background: lighten($node-color, 4%);
    }
    &.selected {
      background: $node-color-selected;
      border-color: #e3c000;
    }
    .title {
      color: white;
      font-family: sans-serif;
      font-size: 18px;
      padding: 8px;
    }
    .output {
      text-align: right;
    }
    .input {
      text-align: left;
    }
    .input-title,
    .output-title {
      vertical-align: middle;
      color: white;
      display: inline-block;
      font-family: sans-serif;
      font-size: 14px;
      margin: $socket-margin;
      line-height: $socket-size;
    }
  }
</style>
