module.exports = {
  'check-coverage': false,
  'per-file': true,
  'skip-full': true,
  "instrument": false,
  "sourceMap": false,
  reporter: [
    'lcov',
    'text',
    'text-summary'
  ],
  include: ['src/**'],
  extension: [
    '.js',
    '.vue'
  ]
};