# JOWebUtils Test App

A simple web app for testing JOWebUtils components. This app uses RequireJS
in place of Odoo's javascript framework.

To mock odoo behaviour, mocks/stubs can be added in `lib/libdefs.js`

## Usage

From the root of the `jowebutils` module, run `npm run testapp` to start the
development server in live-reload mode.

## Rebuilding

To rebuild the test app, run `tsc` from the `testapp` folder

## References

* https://github.com/vercel/serve
* https://github.com/napcs/node-livereload
* https://github.com/kimmobrunfeldt/concurrently
* https://requirejs.org/
