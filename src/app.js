import Vue from 'vue';
import AudioRecorderView from './views/AudioRecorder.vue';
import Timer from './views/Timer.vue';
import Recorder from 'components/Recorder';
import State from 'components/State';

const AUDIO_SRC_NOT_SPECIFIED = '';

export default class {

  /**
   * @typedef {Object} Parameters
   *
   * @property {string} title Title
   * @property {Object} l10n Translations
   * @property {string} l10n.download Download button text
   * @property {string} l10n.retry Retry button text
   * @property {string} l10n.finishedRecording Finished recording audio
   * @property {string} l10n.microphoneInaccessible Microphone blocked
   * @property {string} l10n.downloadRecording Download recording message
   */

  /**
   * @constructor
   *
   * @param {Parameters} params Content type parameters
   * @param {string} contentId
   * @param {object} contentData
   */
  constructor(params, contentId, contentData = {}) {
    const rootElement = document.createElement('div');
    rootElement.classList.add('h5p-audio-recorder');

    const recorder = this.recorder = new Recorder();

    const statusMessages = {};
    statusMessages[State.UNSUPPORTED] = params.l10n.microphoneNotSupported;
    statusMessages[State.BLOCKED] = params.l10n.microphoneInaccessible;
    statusMessages[State.READY] = params.l10n.statusReadyToRecord;
    statusMessages[State.RECORDING] = params.l10n.statusRecording;
    statusMessages[State.PAUSED] = params.l10n.statusPaused;
    statusMessages[State.FINISHED] = params.l10n.statusFinishedRecording;

    AudioRecorderView.data = () => ({
      title: params.title,
      state: recorder.supported() ? State.READY : State.UNSUPPORTED,
      statusMessages,
      l10n: params.l10n,
      audioSrc: AUDIO_SRC_NOT_SPECIFIED,
      audioFilename: ''
    });

    // Create recording wrapper view
    const viewModel = new Vue({
      ...AudioRecorderView,
      components: {
        timer: Timer
      }
    });

    // resize iframe on state change
    viewModel.$watch('state', () => this.trigger('resize'));

    // Start recording when record button is pressed
    viewModel.$on('recording', () => {
      recorder.start();
    });

    viewModel.$on('finished', () => {
      recorder.stop();
      recorder.getWavURL().then(url => {
        viewModel.audioSrc = url;
        // Create a filename using the title
        let filename = params.title.substr(0, 20);
        viewModel.audioFilename = filename.toLowerCase().replace(/ /g, '-') + '.wav';
        this.trigger('resize')
      }).catch((e) => {
        // TODO - add something in the UI!
        console.log('Could not generate wav file');
      });
    });

    viewModel.$on('retry', () => {
      recorder.reset();
      viewModel.audioSrc = AUDIO_SRC_NOT_SPECIFIED;
    });

    viewModel.$on('paused', () => {
      recorder.stop();
    });

    // Update UI when on recording events
    recorder.on('recording', () => {
      viewModel.state = State.RECORDING;
    });

    recorder.on('blocked', () => {
      viewModel.state = State.BLOCKED;
    });

    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).appendChild(rootElement);
      viewModel.$mount(rootElement);
    };
  }
}
