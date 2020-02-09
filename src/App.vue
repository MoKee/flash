<template>
  <v-app>
    <h1 v-html="$t('title')" />

    <v-snackbar v-model="snackbarShown">
      {{ snackbarText }}
    </v-snackbar>

    <v-content>
      <v-container class="container">
        <v-stepper v-model="step" vertical>
          <v-stepper-step v-bind:complete="step > 1" step="1">
            <span class="step">{{ $t('step1:title') }}</span>
          </v-stepper-step>

          <v-stepper-content step="1">
            <div class="section" v-if="supported">
              <p v-html="$t('step1:p1')" />
              <p>
                <ol>
                  <li v-html="$t('step1:p1:li1')" />
                  <li v-html="$t('step1:p1:li2')" />
                  <li v-html="$t('step1:p1:li3')" />
                  <li v-html="$t('step1:p1:li4')" />
                  <li v-html="$t('step1:p1:li5')" />
                </ol>
              </p>
            </div>
            <div class="section" v-else>
              <p v-html="$t('step1:unsupported:p1')" />
              <p v-html="$t('step1:unsupported:p2')" />
            </div>
            <div class="nav" v-if="supported">
              <v-btn color="primary" v-on:click="step = 2">{{ $t('step1:next') }}</v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-bind:complete="step > 2" step="2" v-bind:rules="[() => supported]">
            <span class="step" v-if="!supported">{{ $t('step2:title:unsupported') }}</span>
            <span class="step" v-else-if="selected">{{ $t('step2:title:selected', { name: selected ? selected.name : null }) }}</span>
            <span class="step" v-else>{{ $t('step2:title') }}</span>
          </v-stepper-step>

          <v-stepper-content step="2">
            <div class="section">
              <upload
                class="upload"
                ref="upload"
                accept="application/zip"
                extensions="zip"
                v-model="files"
                v-bind:drop="true"
                v-bind:drop-directory="false"
                v-on:input-file="selectFile"
              >
                <div class="upload-hint active" v-if="uploader && uploader.dropActive" v-html="$t('step2:uploader:active')" />
                <div class="upload-hint selected" v-else-if="selected">{{selected ? selected.name : null}}</div>
                <div class="upload-hint" v-else v-html="$t('step2:uploader:normal')" />
              </upload>
            </div>
            <div class="nav">
              <v-btn color="primary" v-on:click="step = 3" v-bind:disabled="!selected">{{ $t('step2:next') }}</v-btn>
              &nbsp;
              <v-btn text v-on:click="step = 1">{{ $t('step2:previous') }}</v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-bind:complete="step > 3" step="3">
            <span class="step" v-if="name">{{ $t('step3:title:connected', { name }) }}</span>
            <span class="step" v-else>{{ $t('step3:title') }}</span>
          </v-stepper-step>

          <v-stepper-content step="3">
            <div class="section">
              <p v-html="$t('step3:p1')" />
              <p v-html="$t('step3:p2')" />
            </div>
            <div class="nav">
              <v-btn color="primary" v-on:click="connect">{{ $t('step3:connect') }}</v-btn>
              &nbsp;
              <v-btn text v-on:click="step = 2">{{ $t('step3:previous') }}</v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-bind:complete="step > 4" step="4">
            <span class="step">{{ $t('step4:title') }}</span>
          </v-stepper-step>

          <v-stepper-content step="4">
            <div class="section" v-if="flashing">
              <p v-html="$t('step4:flashing')" />
              <v-progress-linear
                v-bind:value="progress ? Math.round(progress / progressTotal * 100) : 0"
                v-bind:indeterminate="progress == 0"
              />
            </div>
            <div class="section" v-else>
              <p v-html="$t('step4:p1')" />
            </div>
            <div class="nav" v-if="!flashing">
              <v-btn color="primary" v-on:click="sideload">{{ $t('step4:start') }}</v-btn>
              &nbsp;
              <v-btn text v-on:click="step = 3">{{ $t('step4:previous') }}</v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-bind:complete="step > 5" step="5">
            <span class="step">{{ $t('step5:title') }}</span>
          </v-stepper-step>

          <v-stepper-content step="5">
            <div class="section">
              <p v-html="$t('step5:p1')" />
            </div>
            <div class="nav">
              <v-btn color="primary" v-on:click="reset">{{ $t('step5:reset') }}</v-btn>
            </div>
          </v-stepper-content>
        </v-stepper>
      </v-container>
    </v-content>

    <footer>
      Copyright &copy; 2020 MoKee Open Source Project
    </footer>

  </v-app>
</template>

<script>
import Adb from 'webadb';
import upload from 'vue-upload-component';

import readFile from './utils/readFile';

export default {
  name: 'App',
  components: {
    upload,
  },
  data() {
    return {
      supported: typeof navigator.usb != 'undefined',
      step: 1,
      name: null,
      files: [],
      uploader: null,
      selected: null,
      flashing: false,
      progress: 0,
      progressTotal: 0,
      snackbarShown: false,
      snackbarText: '',
    };
  },
  watch: {
    step() {
      this.uploader = this.$refs.upload;
    },
  },
  methods: {
    showSnackbar(text) {
      this.snackbarText = text;
      this.snackbarShown = true;
    },
    selectFile(file) {
      if (!file) {
        this.selected = null;
      } else if (!file.name.endsWith('.zip')) {
        this.selected = null;
        this.showSnackbar(this.$t('hint:zip'));
      } else {
        this.selected = file.file;
        this.step = 3;
      }
    },
    async connect() {
      try {
        this.usb = await Adb.open('WebUSB');
        this.adb = await this.usb.connectAdb('host::');
        if (this.adb.mode != 'sideload') {
          this.showSnackbar(this.$t('hint:sideload'));
          this.usb.close();
          return;
        }

        const { manufacturerName, productName } = this.usb.device;
        this.name = `${manufacturerName} ${productName}`;
        this.step = 4;
      } catch (e) {
        console.error(e);
        if (e.name != 'NotFoundError') {
          this.showSnackbar(this.$t('hint:connect'));
        }
      }
    },
    async sideload() {
      this.flashing = true;
      this.progress = 0;

      const chunk_size = 64 * 1024;

      const content = await readFile(this.selected);
      const stream = await this.adb.open(`sideload-host:${content.length}:${chunk_size}`);

      this.progressTotal = content.length;

      while (this.flashing) {
        const response = await stream.receive();

        if (response.cmd == 'OKAY') {
          await stream.send('OKAY');
        }

        if (response.cmd != 'WRTE') {
          continue;
        }

        const result = new TextDecoder("utf-8").decode(response.data);
        if (result == 'DONEDONE' || result == 'FAILFAIL') {
          this.step = 5;
          this.flashing = false;
          break;
        }

        const start = parseInt(result) * chunk_size;
        let end = start + chunk_size;
        if (end > content.length) {
          end = content.length;
        }

        const data = content.slice(start, end);

        await stream.send('WRTE', data);
        await stream.send('OKAY');

        this.progress += data.length;
      }
    },
    reset() {
      this.name = null;
      this.selected = null;
      this.progress = 0;
      this.progressTotal = 0;
      this.step = 1;
    },
  },
};
</script>

<style>
h1 {
  font-size: 24px;
  font-weight: normal;
  margin: 20px 20px 10px;
}

h1 small {
  font-size: 14px;
}

footer {
  font-size: 12px;
  color: #999;
  margin: 0 16px 20px;
}

.container {
  margin: 0;
  max-width: 600px;
}

.step {
  margin-left: 4px;
  font-size: 15px;
  font-weight: bold;
}

.section {
  margin: 4px 4px 20px;
}

.nav {
  margin: 4px;
}

.upload {
  display: block;
  width: 100%;
}

.upload * {
  cursor: pointer;
}

.upload-hint {
  text-align: center;
  padding: 40px 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 2px dotted #eee;
  border-radius: 8px;
  transition: background, border-color 300ms;
}

.upload-hint.active {
  background: #BBDEFB;
  border-color: #64B5F6;
}

.upload-hint.selected {
  border-color: #1E88E5;
}
</style>
