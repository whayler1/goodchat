exports.command = function(email, password) {
    const client = this;

    // JW: Cheap way of not throwing an error before client.page is created
    if ('page' in this) {
      const home = client.page.home();
      const teams = client.page.teams();

      home.navigate()
        .waitForElementVisible('@loginCta', 1000)
        .click('@loginCta');

      client.pause(1000)
        .window_handles((result) =>
          client.switchWindow(result.value[1], () =>
            client.waitForElementVisible('body', 1000)
              .waitForElementVisible('#identifierId', 1000)
              .setValue('#identifierId', email)
              .click('#identifierNext')
              .pause(1000)
              .waitForElementVisible('input[type="password"]', 5000)
              .setValue('input[type="password"]', password)
              .click('#passwordNext')
              .switchWindow(result.value[0])
        )
      );

      teams.waitForElementVisible('@teamPageContent', 7000);
    }

    return client;
  }
