<script lang="ts">
  import type { NodeEditor } from "rete";
  import type { ReteControl } from ".";
  import _ from "lodash-es/lodash";

  import { onMount } from "svelte";

  export let key: string;
  export let editor: NodeEditor;
  export let el;
  export let control: ReteControl;

  export let readonly = false;

  let jsonValue;
  export let value;

  console.log(_);

  $: {
    jsonValue = JSON.stringify(value);
    if (!readonly) {
      editor.trigger("process");
      control.putData(key, value);
    }
  }

  const input = (evt) => {
    console.log("Input", evt);
    try {
      value = JSON.parse(evt.target.value);
    } catch (e) {}
  };

  onMount(() => {
    value = control.getData(key);
    console.log("Mount Value", control);
  });
</script>

<textarea type="text" {readonly} value={jsonValue} on:input={input} />

<style>
  textarea {
    width: 100%;
    resize: vertical;
  }
</style>
