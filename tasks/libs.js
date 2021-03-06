const Task = require('gloom/Task');
const Gulp = require('gulp');
const FS = require('fs');
const Path = require('path');
const Yaml = require('js-yaml');

module.exports = class LibsTask extends Task {

  key() {
    return 'libs';
  }

  tags() {
    return ['watcher'];
  }

  defaultConfig() {
    return {
      libs: {
        src: 'src/libs',
        dest: 'dist/libs',
        file: 'libs.yml',
      },
    };
  }

  task() {
    Gulp.task('libs', (cb) => {
      const srcs = this.getLibsSrc();
      if (srcs) {
        this.manager.mkdirs(this.manager.path(), ...Path.normalize(this.manager.config.libs.dest).split(Path.sep));
        for (const src of srcs) {
          if (FS.existsSync(src)) {
            FS.writeFileSync(this.manager.path(this.manager.config.libs.dest, Path.basename(src)), FS.readFileSync(src));
          }
        }
      }
      cb();
    });

    Gulp.task('libs:watch', Gulp.series('libs', (cb) => {
      const path = this.getLibsPath();
      if (path) {
        Gulp.watch(path, Gulp.parallel('libs'));
      }

      return cb();
    }));
  }

  getLibsPath() {
    if (this.manager.config.libs.src === false) return null;
    const libpath = this.manager.path(this.manager.config.libs.src, this.manager.config.libs.file);
    if (FS.existsSync(libpath)) {
      return libpath;
    } else {
      return null;
    }
  }

  getLibsData() {
    const libpath = this.getLibsPath();
    if (libpath === null) return null;
    return Yaml.load(FS.readFileSync(libpath).toString());
  }

  getLibsSrc() {
    const data = this.getLibsData();
    if (data === null) return null;
    const srcs = [];
    for (const lib in data) {
      if (data[lib].js) {
        for (const js in data[lib].js) {
          srcs.push(this.manager.path(this.manager.config.libs.src, js));
        }
      }
      if (data[lib].css) {
        for (const cat in data[lib].css) {
          for (const css in data[lib].css[cat]) {
            srcs.push(this.manager.path(this.manager.config.libs.src, css));
          }
        }
      }
    }
    return srcs;
  }

};