module.exports = {
  'check-coverage': false,
  'instrument': false,
  'sourceMap': false,
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
}
