(function (win, nav) {

    'use strict';

    var AudioContext = win.AudioContext || win.webkitAudioContext,
        getUserMedia = nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia;

    function AudioRecorder() {

        var ar = this;

        ar.attr = {};

        ar.set({
            audioContext: new AudioContext(),
            audioInput: null,
            realAudioInput: null,
            inputPoint: null,
            audioRecorder: null,
            gain: null
        });

    }

    AudioRecorder.prototype = {

        defaults: {
            gain: {
                min: 0,
                record: 0.5,
                max: 1
            }
        },

        set: function (keyOrData, value) {

            if (typeof keyOrData === 'string') {
                this.attr[keyOrData] = value;
                return this;
            }

            var i,
                attr = this.attr;

            for (i in keyOrData) {
                if (keyOrData.hasOwnProperty(i)) {
                    attr[i] = keyOrData[i];
                }
            }

            return this;

        },

        get: function (key) {
            return this.attr[key];
        },

        init: function () {

            var ar = this;

            return new Promise(function (resolve, reject) {

                getUserMedia.call(nav, {
                        "audio": {
                            "mandatory": {
                                "googEchoCancellation": "false",
                                "googAutoGainControl": "false",
                                "googNoiseSuppression": "false",
                                "googHighpassFilter": "false"
                            },
                            "optional": []
                        }
                    },
                    function (stream) {
                        ar.gotStream(stream);
                        resolve();
                    },
                    function (e) {
                        alert('Error getting audio');
                        console.log(e);
                        reject();
                    });

            });

        },

        gotStream: function (stream) {

            var ar = this,
                audioContext = ar.get('audioContext'),
                inputPoint = audioContext.createGain(),
                realAudioInput = audioContext.createMediaStreamSource(stream),
                audioInput = ar.convertToMono(realAudioInput), // audioInput = realAudioInput
                audioRecorder = new Recorder(inputPoint),
                gain;

            audioInput.connect(inputPoint);

            gain = audioContext.createGain();
            gain.gain.value = ar.defaults.gain.min;

            inputPoint.connect(gain);
            gain.connect(audioContext.destination);

            ar.set('inputPoint', inputPoint);
            ar.set('realAudioInput', realAudioInput);
            ar.set('audioInput', audioInput);
            ar.set('audioRecorder', audioRecorder);
            ar.set('gain', gain);

        },

        convertToMono: function (input) {

            var ar = this,
                audioContext = ar.get('audioContext'),
                splitter = audioContext.createChannelSplitter(2),
                merger = audioContext.createChannelMerger(2);

            input.connect(splitter);

            splitter.connect(merger, 0, 0);
            splitter.connect(merger, 0, 1);

            return merger;

        },

        startRecord: function (dataArg) {

            var ar = this,
                data = dataArg || {},
                audioRecorder = ar.get('audioRecorder');

            ar.get('gain').gain.value = data.hasOwnProperty('gain') ? data.gain : ar.defaults.gain.record;

            audioRecorder.clear();
            audioRecorder.record();

        },

        stopRecord: function () {

            var ar = this,
                audioRecorder = ar.get('audioRecorder');

            ar.get('gain').gain.value = ar.defaults.gain.min;

            audioRecorder.stop();

            return new Promise(function (resolve, reject) {

                audioRecorder.getBuffers(function () {
                    audioRecorder.exportMonoWAV(resolve);
                });

            });

        }

    };

    win.ar = new AudioRecorder();

    win.ar.init().then(function () {
        win.ar.startRecord();
    });

    setTimeout(function () {

        win.ar.stopRecord().then(function (blob) {
            console.log(blob);
        });

    }, 2000);

}(window, window.navigator));