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
            audioRecorder: null
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

        init: function (cb) {

            var ar = this;

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
                return cb && cb();
            },
            function (e) {
                alert('Error getting audio');
                console.log(e);
            });

            return ar;

        },

        gotStream: function (stream) {

            var ar = this,
                audioContext = ar.get('audioContext'),
                gain;

            ar.set('inputPoint', audioContext.createGain());   // inputPoint = audioContext.createGain();

            // Create an AudioNode from the stream.
            ar.set('realAudioInput', audioContext.createMediaStreamSource(stream)); // realAudioInput = audioContext.createMediaStreamSource(stream);
            //ar.set('audioInput', ar.convertToMono( ar.get('realAudioInput') ));
            ar.set('audioInput', ar.convertToMono( ar.get('realAudioInput') ));
            ar.get('audioInput').connect(ar.get('inputPoint'));    // audioInput.connect(inputPoint);

            ar.set('audioRecorder', new Recorder(ar.get('inputPoint'))); // audioRecorder = new Recorder(inputPoint);

            gain = audioContext.createGain();
            gain.gain.value = ar.defaults.gain.min;
            ar.get('inputPoint').connect(gain);
            gain.connect(audioContext.destination);
            
            ar.set('gain', gain);
            
        },

        convertToMono: function(input) {

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

            audioRecorder.getBuffers(function () {

                function setupDownload (blob) {
                    var url = (window.URL || window.webkitURL).createObjectURL(blob);
                    //var link = document.getElementById("save");
                    //link.href = url;
                    //link.download = filename || 'output.wav';
                    console.log(url)

                }

                audioRecorder.exportWAV(setupDownload);

            });

        }

    };








    win.ar = new AudioRecorder();

    win.ar.init(function(){

        win.ar.startRecord();

    });

    setTimeout(function(){

        win.ar.stopRecord();

    }, 2000);

}(window, window.navigator));