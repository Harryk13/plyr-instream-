/* eslint-disable import/no-extraneous-dependencies */
// ==========================================================================

const gulp = require('gulp');
const Rsync = require('rsync');

gulp.task('deploy', (done) => {
  const rsync = new Rsync()
    .shell('ssh')
    .flags('az')
    .source(['./demo/dist', './demo/index-prod.html'])
    .destination('root@node1-cdn.verta.host:/var/www/cdn/microplayer/');

  rsync.execute((error) => {
    if (error) {
      console.error('Failed upload', error);
    }
    done();
  });
});
