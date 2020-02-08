<template>
  <v-app>
    <h1>MoKee 浏览器刷机向导 <small>(beta)</small></h1>

    <v-snackbar v-model="snackbarShown">
      {{ snackbarText }}
    </v-snackbar>

    <v-content>
      <v-container class="container">
        <v-stepper v-model="step" vertical>
          <v-stepper-step v-bind:complete="step > 1" step="1">
            <span class="step">准备</span>
          </v-stepper-step>

          <v-stepper-content step="1">
            <div class="section" v-if="supported">
              <p>你需要准备以下事情：</p>
              <p>
                <ol>
                  <li>一部<a href="https://download.mokeedev.com/devices.html">受支持的手机</a>，并且已经刷入了 TWRP；</li>
                  <li>将手机重启到 TWRP 模式；</li>
                  <li>如果你是第一次使用魔趣，请进行一次数据清除操作（如果不是特别情况，不需要进行高级清除）；</li>
                  <li>你可能还需要将底包更新到 ROM 所要求的版本；</li>
                  <li>你已经下载好了魔趣 ROM 的卡刷包。</li>
                </ol>
              </p>
            </div>
            <div class="section" v-else>
              <p>你的浏览器不支持 WebUSB API。</p>
              <p>建议更换为最新版本的 Google Chrome。</p>
            </div>
            <div class="nav" v-if="supported">
              <v-btn color="primary" v-on:click="step = 2">继续</v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-bind:complete="step > 2" step="2" v-bind:rules="[() => supported]">
            <span class="step" v-if="!supported">浏览器不支持</span>
            <span class="step" v-else-if="selected">已选择: {{selected ? selected.name : null}}</span>
            <span class="step" v-else>选择刷机包</span>
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
                <div class="upload-hint active" v-if="uploader && uploader.dropActive">
                  将刷机包推动到此处并放下
                </div>
                <div class="upload-hint selected" v-else-if="selected">
                  {{selected ? selected.name : null}}
                </div>
                <div class="upload-hint" v-else>
                  将刷机包拖动到此处或<a>点击选择</a>
                </div>
              </upload>
            </div>
            <div class="nav">
              <v-btn
                color="primary"
                v-on:click="step = 3"
                v-bind:disabled="!selected"
              >下一步</v-btn>
              &nbsp;
              <v-btn text v-on:click="step = 1">上一步</v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-bind:complete="step > 3" step="3">
            <span class="step" v-if="name">已连接: {{name}}</span>
            <span class="step" v-else>连接手机</span>
          </v-stepper-step>

          <v-stepper-content step="3">
            <div class="section">
              <p>请将手机切换到 TWRP 的 ADB Sideload 模式并连接到电脑，然后点击下面的「连接手机」按钮。在弹出的对话框中选中你的手机，并点击「连接」。</p>
              <p>如果你是在 Windows 下刷机，并且在对话框中看不到你的手机，你可能需要先安装<a href="https://developer.android.com/studio/run/win-usb">相应的驱动程序</a>。</p>
            </div>
            <div class="nav">
              <v-btn color="primary" v-on:click="connect">连接手机</v-btn>
              &nbsp;
              <v-btn text v-on:click="step = 2">上一步</v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-bind:complete="step > 4" step="4">
            <span class="step">刷机</span>
          </v-stepper-step>

          <v-stepper-content step="4">
            <div class="section" v-if="flashing">
              <p>正在刷入，请稍候…</p>
              <v-progress-linear v-bind:value="progress" />
            </div>
            <div class="section" v-else>
              <p>一切就绪，请点击「开始刷机」。</p>
            </div>
            <div class="nav" v-if="!flashing">
              <v-btn color="primary" v-on:click="sideload">开始刷机</v-btn>
              &nbsp;
              <v-btn text v-on:click="step = 3">上一步</v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-bind:complete="step > 5" step="5">
            <span class="step">完成</span>
          </v-stepper-step>

          <v-stepper-content step="5">
            <div class="section">
              <p>恭喜，刷机已完成。如果没遇到什么错误，你现在可以重启你的手机了。<a>遇到错误？</a></p>
            </div>
            <div class="nav">
              <v-btn color="primary" v-on:click="step = 1">完成并返回开始</v-btn>
            </div>
          </v-stepper-content>
        </v-stepper>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Adb from 'webadb';
import upload from 'vue-upload-component';

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
        this.showSnackbar('刷机包文件应该是 ZIP 格式');
      } else {
        this.selected = file;
      }
    },
    async connect() {
      try {
        this.usb = await Adb.open('WebUSB');
        this.adb = await this.usb.connectAdb('host::');
        console.log(this.usb);
        console.log(this.adb);
        if (this.adb.mode != 'sideload') {
          this.showSnackbar('手机未处于 Sideload 模式');
          this.usb.close();
          return;
        }

        const { manufacturerName, productName } = this.usb.device;
        this.name = `${manufacturerName} ${productName}`;
        this.step = 4;
      } catch (e) {
        console.error(e);
        if (e.name != 'NotFoundError') {
          this.showSnackbar('连接失败，请重试');
        }
      }
    },
    async sideload() {
      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      this.flashing = true;

      for (let i = 0; i <= 100; i++) {
        this.progress = i;
        await sleep(200);
      }

      this.step = 5;
      this.flashing = false;
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
