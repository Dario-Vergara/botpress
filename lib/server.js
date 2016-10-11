const express = require('express');
const chalk = require('chalk');
const path = require('path');
const Promise = require('bluebird');
const util = require('./util');

const serveStatic = function(app) {
  app.use(express.static(path.join(__dirname, '../web/dist')))

  app.get('/api/modules', (req, res, next) => {
    res.send([{ name: 'skin-messenger', menuText: 'Messenger', menuIcon: 'icon-social-facebook' }])
  })

  app.get('*', (req, res, next) => {
    if(/html/i.test(req.headers.accept)) {
      return res.sendFile(path.join(__dirname, '../web/dist/index.html'))
    }
    next()
  })

  if (util.isDeveloping) {
    return new Promise(function(resolve, reject) {
      // backup current working directory
      const cwd = process.cwd()
      util.print('(dev mode) Compiling website...')
      try {
        process.chdir(path.join(__dirname, '../web'))
        const gulp = require(path.join(__dirname, '../web/gulpfile'))
        gulp.skipLogs = true
        gulp.on('done', resolve)
        gulp.on('error', (err) => {
          util.print('err', '(gulp) ' + err)
        })
        gulp.start('default')
      }
      catch (err) {
        reject(err)
      }
      finally {
        // restore initial working directory
        process.chdir(cwd);
      }
    })
  } else {
    return Promise.resolve()
  }
}

class WebServer {

  constructor({ skin }) {
    this.skin = skin
  }

  start() {
    const app = express()
    serveStatic(app)
    .then (function() {
      app.listen(3000, function() {
        util.print('success', '(web server) listening on port ' + chalk.bold('3000'))
      })
    })
  }

}

module.exports = WebServer;