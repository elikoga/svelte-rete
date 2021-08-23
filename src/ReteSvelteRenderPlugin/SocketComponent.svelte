<script>
  export let type;
  export let bindSocket;
  export let socket;
  export let io;
  let socketDiv;
  const kebap = (str) => {
    const replace = (s) => s.toLowerCase().replace(/ /g, "-");

    return Array.isArray(str) ? str.map(replace) : replace(str);
  };

  $: socketDiv && bindSocket(socketDiv, type, io);
</script>

<div
  bind:this={socketDiv}
  class="socket {type} {kebap(socket.name)}"
  title={socket.name}
/>

<style lang="scss">
  @import "./vars";
  .socket {
    display: inline-block;
    cursor: pointer;
    border: 1px solid white;
    border-radius: $socket-size/2.0;
    width: $socket-size;
    height: $socket-size;
    margin: $socket-margin;
    vertical-align: middle;
    background: $socket-color;
    z-index: 2;
    box-sizing: border-box;
    &:hover {
      border-width: 4px;
    }
    &.multiple {
      border-color: yellow;
    }
    &.output {
      margin-right: -$socket-size / 2;
    }
    &.input {
      margin-left: -$socket-size / 2;
    }
  }
</style>
