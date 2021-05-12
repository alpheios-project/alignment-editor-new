<template>
  <div class="alpheios-tooltip">
    <slot></slot>
    <span class = "alpheios-tooltiptext alpheios-tooltiptext-span alpheios-text__smaller"
          v-bind:class = "directionClass"
          v-bind:style = "additionalStyles"
          v-show = "tooltipText"
          dir = "ltr"
    >
      {{ tooltipText }}
    </span>
  </div>
</template>
<script>
export default {
  name: 'tooltip',
  props: {
    tooltipDirection: {
      type: String,
      required: false,
      default: 'bottom'
    },
    tooltipText: {
      type: String,
      required: true
    },
    additionalStyles: {
      type: Object,
      required: false
    }
  },
  computed: {
    directionClass () {
      const tooltipDirection = this.tooltipDirection.toLowerCase()

      switch (tooltipDirection) {
        case 'top':
          return { 'alpheios-tooltip-top': true }
        case 'bottom':
          return { 'alpheios-tooltip-bottom': true }
        case 'bottom-wide':
          return { 'alpheios-tooltip-bottom-wide': true }
        case 'bottom-narrow':
          return { 'alpheios-tooltip-bottom-narrow': true }
        case 'bottom-narrow2':
          return { 'alpheios-tooltip-bottom-narrow2': true }
        case 'left':
          return { 'alpheios-tooltip-left': true }
        case 'right':
          return { 'alpheios-tooltip-right': true }
        case 'bottom-right':
          return { 'alpheios-tooltip-bottom-right': true }
        case 'bottom-left':
          return { 'alpheios-tooltip-bottom-left': true }
        case 'top-right':
          return { 'alpheios-tooltip-top-right': true }
        case 'top-left':
          return { 'alpheios-tooltip-top-left': true }
        default:
          return { 'alpheios-tooltip-bottom': true }
      }
    }
  }
}
</script>
<style lang="scss">
  .alpheios-tooltip {
    position: relative;
    display: inline-block;

    span.alpheios-tooltiptext.alpheios-tooltiptext-span {
      visibility: hidden;
      position: absolute;
      width: 120px;
      padding: 5px;
      background-color: #fff;
      border: 1px solid #757575;
      border-radius: 10px;
      z-index: 10000;
      opacity: 0;
      transition: opacity .6s;
      display: none;
      font-size: 12px;
      text-align: center;
      font-weight: normal;

      text-transform: initial;
      white-space: normal;
    }
  }

  .alpheios-tooltip:hover span.alpheios-tooltiptext.alpheios-tooltiptext-span {
    visibility: visible;
    opacity: 1;
    display: inline;
  }

  .alpheios-tooltip-top {
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
  }

  .alpheios-tooltip-top::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #757575 transparent transparent transparent;
  }

  .alpheios-tooltip-top-right {
    bottom: 125%;
    right: 0;
    margin-left: -50%;
  }

  .alpheios-tooltip-top-right::after {
    content: "";
    position: absolute;
    top: 100%;
    right: 15%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #757575 transparent transparent transparent;
  }

  .alpheios-tooltip-top-left {
    bottom: 125%;
    left: 0;
  }

  .alpheios-tooltip-top-left::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    margin-left: 5px;
    border-width: 5px;
    border-style: solid;
    border-color: #757575 transparent transparent transparent;
  }

  .alpheios-tooltip-right {
    top: 50%;
    transform: translateY(-50%);
    left: 125%;
  }

  .alpheios-tooltip-right::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%;
    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent #757575 transparent transparent;
  }

  .alpheios-tooltip-bottom {
    top: 135%;
    left: 50%;
    margin-left: -50%;
  }

  .alpheios-tooltip-bottom-wide {
    top: 135%;
    left: -30%;
  }

  .alpheios-tooltip-bottom-narrow {
    top: 135%;
    left: -75%;
  }

  .alpheios-tooltip-bottom-narrow2 {
    top: 135%;
    left: -165%;
  }

  .alpheios-tooltip-bottom::after,
  .alpheios-tooltip-bottom-wide::after,
  .alpheios-tooltip-bottom-narrow::after,
  .alpheios-tooltip-bottom-narrow2::after  {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent #757575 transparent;
  }

  .alpheios-tooltip-bottom-right {
    top: 135%;
    right: 0;
    margin-left: -50%;
  }

  .alpheios-tooltip-bottom-right::after {
    content: "";
    position: absolute;
    bottom: 100%;
    right: 15%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent #757575 transparent;
  }

  .alpheios-tooltip-bottom-left {
    top: 135%;
    right: 0;
    left: auto;
  }

  .alpheios-tooltip-bottom-left::after {
    content: "";
    position: absolute;
    bottom: 100%;
    right: 15%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent #757575 transparent;
  }

  .alpheios-tooltip-left {
    top: 50%;
    transform: translateY(-50%);
    bottom: auto;
    right: 128%;
  }

  .alpheios-tooltip-left::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 100%;
    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent transparent #757575;
  }
</style>
