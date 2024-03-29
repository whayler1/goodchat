module.exports = {
  "src_folders" : ["./test/e2e"],
  "output_folder" : "./test/e2e/reports",
  "custom_commands_path" : "./test/e2e/commands",
  "custom_assertions_path" : "",
  "page_objects_path" : "./test/e2e/pages",
  "globals_path" : "",

  "selenium" : {
    "start_process" : true,
    "server_path" : "./node_modules/selenium-standalone/.selenium/selenium-server/3.4.0-server.jar",
    "log_path" : "./test/e2e/log",
    "port" : 4444,
    "cli_args" : {
      "webdriver.chrome.driver" : "./node_modules/selenium-standalone/.selenium/chromedriver/2.30-x64-chromedriver"
    }
  },

  "test_settings" : {
    "default" : {
      "launch_url" : "http://localhost:3000",
      "selenium_port"  : 4444,
      "selenium_host"  : "localhost",
      "silent": true,
      "screenshots" : {
        "enabled" : false,
        "path" : ""
      },
      "desiredCapabilities": {
        "browserName": "chrome",
        "javascriptEnabled": true
      }
    },

    "chrome" : {
      "desiredCapabilities": {
        "browserName": "chrome"
      }
    }
  }
}
