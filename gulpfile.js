const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const fs = require("fs");
const { fork } = require('child_process');
const path = require("path");
const yaml = require("js-yaml");
const _ = require("lodash");
const replace = require('gulp-replace');

const envConfig = yaml.load(fs.readFileSync("env-config.yaml"));

const distDir = "./dist";
const srcDir = "./src";
const espReadyBundleFileName = "bundle.js";
const espReadyBundlePath = path.join(distDir, espReadyBundleFileName);
const appFileName = "app.js";
const appFilePath = path.join(distDir, appFileName);
const appConfigTsFileName = "app-config.ts";
const appConfigFileName = "app-config.yaml";
const userAppConfigFileName = "app-config.user.yaml";
const espConsoleBeingWatchedFileName = "esp-console-input.js";
const espConsoleBeingWatchedFilePath = path.join(distDir, espConsoleBeingWatchedFileName);


function prepare_for_espruino(cb) {
    if (!fs.existsSync(appFilePath)) {
        cb("main app file does not exit " + appFilePath);
        return;
    }

    let appContent = fs.readFileSync(appFilePath).toString();
    appContent = appContent.replace('Object.defineProperty(exports, "__esModule", { value: true });', "");
    fs.writeFileSync(appFilePath, appContent);

    const buildproc = fork(
        require.resolve("espruino/bin/espruino-cli"),
        ["--board", envConfig.board, appFileName, "-o", espReadyBundleFileName],
        { cwd: distDir });
    buildproc.on('close', () => {
        cb();
    });
}

function compile_ts() {
    const tsResult = tsProject.src().pipe(tsProject());
      // .on('error', function (err) {
      //     console.error('[TypeScript compile error]', err.message);
      //     this.emit('end'); // 🔧 продолжить, даже если ошибка
      // });
    return tsResult.js.pipe(gulp.dest(distDir));
}

function content_to_dist() {
    return gulp
        .src("src/**/*.js", { base: 'src' })
        .pipe(gulp.dest(distDir));
}

function rewrite_imports() {
    // В espruino все очень плохо с импортами, приходится задавать путь относительно dist/
    return gulp.src('dist/**/*.js')
      .pipe(replace(/@alias-esp\//g, './')) // вот и всё
      .pipe(gulp.dest('dist'));
}

function send_to_espruino_console(cb) {
    const content = fs.readFileSync(espReadyBundlePath);
    fs.writeFile(
        espConsoleBeingWatchedFilePath,
        content,
        (err) => {
            if (err) { throw err; }
            cb();
        });
}

function clear_espruino_watch_file(cb) {
    fs.writeFile(
        espConsoleBeingWatchedFilePath,
        "",
        (err) => {
            if (err) { throw err; }
            cb();
        });
}

function espruino_console(cb) {
    const buildproc = fork(
        require.resolve("espruino/bin/espruino-cli"),
        ["--board", envConfig.board, "-b", envConfig.port_speed, "--port", envConfig.port, "-w", espConsoleBeingWatchedFileName],
        { cwd: distDir });
    buildproc.on('close', () => {
        cb();
    });
}

function gen_config_ts(cb) {
    if (!fs.existsSync(userAppConfigFileName)) {
        const content = fs.readFileSync(appConfigFileName)
            .toString()
            .split("\n")
            .map(x => `# ${x}`)
            .join("\n");

        fs.writeFileSync(userAppConfigFileName, content, { encoding: "utf-8" });
    }

    const appConfig = yaml.load(fs.readFileSync(appConfigFileName));
    const userAppConfig = yaml.load(fs.readFileSync(userAppConfigFileName));
    const mergedAppConfig = _.assign(appConfig, userAppConfig);
    const jsonString = JSON.stringify(mergedAppConfig);
    const resultConfigTsContent = `export default ${jsonString};`;
    fs.writeFileSync(path.join(srcDir, appConfigTsFileName), resultConfigTsContent);
    cb();
}

gulp.task("gen-config-ts", gen_config_ts);

gulp.task("compile-ts", gulp.series("gen-config-ts", compile_ts));

gulp.task("content-to-dist", content_to_dist);

gulp.task("prepare-for-espruino", gulp.series('compile-ts', 'content-to-dist', rewrite_imports, prepare_for_espruino));

gulp.task("build", gulp.series("prepare-for-espruino"));

gulp.task("send-to-espruino-console", send_to_espruino_console);

gulp.task("clear-espurino-watch-file", clear_espruino_watch_file);

gulp.task("espruino-console", gulp.series("clear-espurino-watch-file", espruino_console));
