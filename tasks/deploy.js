/* eslint-disable import/no-extraneous-dependencies */
// ==========================================================================

const gulp = require('gulp');
const Rsync = require('rsync');
const requestPromise = require('request-promise');

const filesToDropCache = [
  'integrator.min.js',
  'integration.css',
  'plyr.polyfilled.min.js',
  'configs/vikna.playlist.json',
];
gulp.task('deploy', (done) => {
  const rsync = new Rsync()
    .shell('ssh')
    .flags('az')
    .source(['./demo/dist', './demo/*.html'])
    .destination('root@node1-cdn.verta.host:/var/www/cdn/microplayer/');

  rsync.execute((error) => {
    if (error) {
      console.error('Failed upload', error);
    }
    done();
  });
});

gulp.task('clean-cache', (done) => {
  const pullZone = '6a628312-222b-4e7f-8f0a-5eef0d0c008b';
  const token =
    'eyJraWQiOiJ4UTVmbFI5NDBiMXdjTW85NFBMUHhHdzFyb1pCSXBTYnFReWlqcWZUc0xzIiwidHlwIjoiSldUIiwiYWxnIjoiUlM1MTIifQ.eyJpc3MiOiJOb3BlIiwiaWF0IjoxNjM0NjQ5Mjc0LCJqdGkiOiI4NDFhZGUzNy1kOWVkLTQ0ODMtOGJmMC0wY2IzZmRiMTg3YjMiLCJ1c2VyIjp7ImlkIjoiYTIxOTUyNTQtZGEyMC00NjVlLWJlNmItNjI4MGQzMDY3NGU1IiwiaW1wZXJzb25hdG9yX2lkIjpudWxsLCJhY2NvdW50X2lkIjoiN2QzOGZiMjktM2M0Ni00MWFhLTk2MjktZmI0MzM1MmMwZWY4IiwiZW1haWwiOiJhZG1pbnNAYWR0ZWxsaWdlbnQuY29tIn19.Gz-xt_hM8PGqgQwrhdNbUQEWqM9WFxu--V2MKk9Vn3z2N1i7S3EQpdp67IMRhkf08k5gcrxl_1Pdq200GuUeTZfoS-L4kO6SNEoLdvE2Rjp6tL9oIljhCm68DeZ1wpqnWHH2V-wxIcbAM3PY1BRSytFLk6o-eYLOmUn320kI1iWMtEDnbC2B249Mfo9p10AGsOcIkz31yQkU_V9IeBwUdwO5cIAtuzi0eFibKNBrYUKQ9qKyaNRGDNU-DW7zA9YX2Poiy1AABd0Gmh5vLV83KNhZfBTtTb39ehrS53gUw8C5lUkkphPs0O-TCfWZsU55XTC0WXAEB60L03d2_Ow6zVZaf55OUrQVHdg1JtN6oGRevQM7VqhSo5qqPhDgj43D9d5z9EhP1VIReRHwF_PrlKINbj5NZ_xeZraofiCH1-XyIDoTu5O7itU5LgP4MncFxMKcuOxD23bLYsjXUwfqM5fgXkva0hazBxccRng6hfei6MSjg3NxNhHgb9jWTR9RNgxfPVW3dmnXPADC87VGSUF7GkBimfHUNU4puVLcX60qPU2MOkrkE5Bp06pvF6hN9Hu2cyQ15MszKG42LkjZJpy8nb4Scvf78zd-AbswNplR3K2WAUgVhlhlMQJRvAjjXeGTsHimDf1b0xhu0_b-Zm80xlm49d14meJKCzOB0dM';
  const files = filesToDropCache.map((fName) => {
    return `/microplayer/${fName}`;
  });
  requestPromise(
    `curl -k -X DELETE "https://api.websa.com/v2/pull_zones/${pullZone}/cache"  -H "Accept: application/json"  -H "Authorization: Bearer ${token}"  -H "Content-Type: application/json"  -d '{ "paths": [${files.join(
      ',',
    )}] }'`,
  ).then(done);
});
