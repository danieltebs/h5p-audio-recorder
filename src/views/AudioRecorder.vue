<template>
  <div class="h5p-audio-recorder-view">
    <div class="recording-indicator-wrapper">
      <div v-bind:class="[{'background-enabled pulse' : state=='recording'}]"></div>
      <div class="fa-microphone"></div>
    </div>
    <div v-if="state !== 'finished'" class="title">
      <span class="title-label">Q:</span>
      {{ title }}
    </div>
    <div role="status" v-bind:class="state">{{statusMessages[state]}}</div>

    <audio class="h5p-audio-recorder-player" v-if="state === 'finished' && audioSrc !== ''"
           controls="controls">
      Your browser does not support the <code>audio</code> element.
      <source v-bind:src="audioSrc">
    </audio>

    <timer v-bind:stopped="state !== 'recording'" v-if="state !== 'unsupported' && state !== 'finished'"></timer>

    <div v-if="state !== 'blocked' && state !== 'unsupported' && state === 'finished'" class="h5p-audio-recorder-download">
      {{ l10n.downloadRecording }}
    </div>

    <div class="button-row">
      <div class="button-row-double">
        <button class="button record"
                v-if="state === 'ready' || state === 'blocked'"
                ref="button-record"
                v-on:click="record">
          <span class="fa-circle"></span>
          {{ l10n.recordAnswer }}
        </button>
      </div>

      <span class="button-row-left">
        <button class="button pause"
                ref="button-pause"
                v-if="state === 'recording'"
                v-on:click="pause">
          <span class="fa-pause"></span>
          {{ l10n.pause }}
        </button>
        <button class="button record"
                ref="button-continue"
                v-if="state === 'paused'"
                v-on:click="record">
          <span class="fa-circle"></span>
          {{ l10n.continue }}
        </button>

        <a class="button download"
                ref="button-download"
                v-if="state === 'finished'"
                v-bind:href="audioSrc"
                v-bind:download="audioFilename">
          <span class="fa-download"></span>
          {{ l10n.download }}
        </a>
      </span>

      <span class="button-row-right">
        <button class="button finish"
                v-if="state === 'recording' || state === 'paused'"
                v-on:click="finish">
          <span class="fa-stop"></span>
          {{ l10n.finish }}
        </button>
        <button class="button retry"
                v-if="state === 'finished'"
                v-on:click="retry">
          <span class="fa-undo"></span>
          {{ l10n.retry }}
        </button>
      </span>
    </div>
  </div>
</template>

<script>
  import State from '../components/State';

  // focus on ref when state is changed
  const refToFocusOnStateChange = {};
  refToFocusOnStateChange[State.READY] = 'button-record';
  refToFocusOnStateChange[State.RECORDING] = 'button-pause';
  refToFocusOnStateChange[State.PAUSED] = 'button-continue';
  refToFocusOnStateChange[State.FINISHED] = 'button-download';

  export default {
    methods: {
      record: function() {
        this.$emit(State.RECORDING);
      },

      pause: function() {
        this.state = State.PAUSED;
        this.$emit(this.state);
      },

      finish: function() {
        this.state = State.FINISHED;
        this.$emit(State.FINISHED);
      },

      retry: function(){
        // TODO Clear existing recording
        const dialog = new H5P.ConfirmationDialog(
          {
            headerText: this.l10n.retryDialogHeaderText,
            dialogText: this.l10n.retryDialogBodyText,
            cancelText: this.l10n.retryDialogCancelText,
            confirmText: this.l10n.retryDialogConfirmText
          }
        );
        dialog.appendTo(H5P.jQuery(".h5p-audio-recorder-view")[0]);
        dialog.show();
        dialog.on('confirmed', () => {
          this.state = State.READY;
          this.$emit('retry');
        });
      }
    },
    watch: {
      state: function(state){
        if(refToFocusOnStateChange[state]) {
          this.$nextTick(() => this.$refs[refToFocusOnStateChange[state]].focus());
        }
      }
    }
  }
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Open+Sans');
  @import "~susy/sass/susy";

  $screen-small: 576px;

  .h5p-audio-recorder-view {
    padding: 1.750em;
    text-align: center;
    font-family: Arial, 'Open Sans', sans-serif;

    [class^="fa-"] {
      font-family: 'H5PFontAwesome4';
    }

    .recording-indicator-wrapper {
      height: 9.375em;
      width: 9.375em;
      margin-left: auto;
      margin-right: auto;
      line-height: 9.375em;
      color: #8e8e8e;
      position: relative;
      margin-bottom: 1em;
    }

    .background-enabled {
      height: 100%;
      width: 100%;
      background-image: url('../images/recording-indicator.svg');
      position: absolute;
    }

    .fa-microphone {
      width: 60%;
      height: 60%;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
      position: absolute;
      font-size: 2.5em;
      border-radius: 50%;
      background-color: white;
      line-height: 2.5em;
    }

    .h5p-audio-recorder-player {
      width: 100%;
      padding: 0 1em;
      box-sizing: border-box;
      height: 2em;
      margin-top: 1.25em;
    }

    .title {
      color: black;
      font-size: 1.875em;
      margin-bottom: 1em;
      line-height: 1.5em;
    }

    .title-label {
      color: #8f8f8f;
    }

    /* status bar */
    [role="status"] {
      background-color: #f8f8f8;
      color: #777777;
      font-size: 1.250em;
      padding: 1.250em;

      &.recording {
       background-color: #f9e5e6;
       color: #da5254;
      }

      &.finished {
        background-color: #e0f9e3;
        color:  #20603d;
      }

      &.blocked {
        background-color: #db8b8b;
        color: black;
      }

      &.unsupported {
        background-color: #db8b8b;
        color: black;
      }
    }

    .h5p-audio-recorder-download {
      font-size: 1.2em;
      padding: 2em;
    }

    .h5p-confirmation-dialog-popup {
      top: 5em;
    }

    .button-row {
      @include container;

      .button-row-double {
        @include span(1 of 1);
      }

      .button-row-left {
        @include span(1 of 1);
        margin-bottom: 0.5em;
      }

      .button-row-right {
        @include span(1 of 1);
        margin-bottom: 0.5em;
      }

      @media (min-width: $screen-small) {
        .button-row-left {
          @include span(first 50% no-gutters);
          text-align: right;
        }

        .button-row-right {
          @include span(last 50% no-gutters);
          text-align: left;
        }
      }
    }

    @mixin button-filled($background-color, $color) {
      background-color: $background-color;
      color: $color;
      border-color: $background-color;

      &:hover {
         background-color: darken($background-color, 5%);
         border-color: darken($background-color, 5%);
       }

      &:active {
         background-color: darken($background-color, 10%);
         border-color: darken($background-color, 10%);
       }

      &[disabled] {
         background-color: lighten($background-color, 40%);
         border-color: lighten($background-color, 40%);
      }
    }

    @mixin button-inverse($background-color, $color) {
      background-color: $background-color;
      color: $color;
      border: 2px solid $color;

      &:hover {
        color: lighten($color, 10%);
        border-color: lighten($color, 10%);
      }

      &:active {
        color: darken($color, 10%);
        border-color: darken($color, 10%);
      }

      &[disabled],
      &[aria-disabled] {
        color: lighten($color, 40%);
        border-color: lighten($color, 40%);
      }
    }

    @mixin blueGlow {
      outline: 0;
      box-shadow: 0.06em 0 0.6em 0.1em lighten(#0a78d1, 30%);
    }

    .button {
      font-size: 1.563em;
      font-family: 'Open Sans', sans-serif;
      padding: 0.708em 1.250em;
      border-radius: 1.375em;
      margin: 0 0.5em;
      border: 0;
      display: inline-block;
      cursor: pointer;
      text-decoration: none;

      [class^="fa-"] {
        margin-right: 0.4em;
      }

      &:focus {
        @include blueGlow
      }

      &.finish,
      &.retry {
        @include button-filled(#5e5e5e, white);
      }

      &.record {
        @include button-filled(#d95354, white);
      }

      &.download {
        @include button-filled(#1f824c, white);
      }

      &.pause {
        @include button-inverse(white, #d95354);
      }
    }
  }

  .pulse {
  	animation-name: pulse_animation;
  	animation-duration: 1000ms;
  	animation-iteration-count: infinite;
  	animation-timing-function: linear;
  }

  @keyframes pulse_animation {
  	0%  { transform: scale(1); }
  	100% { transform: scale(1.1); }
  }
</style>
