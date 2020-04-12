// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('resetDatabase', () => {
  cy.exec('(cd .. && ./helper.sh --docker -- exec -T oms-core-js sh -c \\\'npm run db:clear \\&\\& npm run db:seed\\\')')
})

Cypress.Commands.add('login', (username = 'admin@example.com', password = '5ecr3t5ecr3t') => {
  cy.request({
    method: 'POST',
    url: '/api/core/login',
    body: {
      username,
      password,
    }
  })
    .its('body')
    .then((body) => {
      window.localStorage.setItem('access-token', body.access_token);
      window.localStorage.setItem('refresh-token', body.refresh_token);
    })
});