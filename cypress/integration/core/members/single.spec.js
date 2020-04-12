// / <reference types="cypress" />

context('Members single', () => {
  beforeEach(() => {
    cy.resetDatabase()
    cy.login()
    cy.visit('/members/admin')
  })

  it('should display users', () => {
    cy.contains('Admin')
  })

  it('should display an error on network error', () => {
    cy.server()
    cy.route({
      method: 'GET',
      url: /api\/core\/members\/admin/,
      response: 'Some garbage',
      status: 500
    })

    cy.visit('/members/admin')
    cy.contains('Some error happened')
  })

  it('should redirect if the user is not found', () => {
    cy.visit('/members/not-existant')
    cy.contains('User is not found')
    cy.url().should('match', /\/members$/)
  })
})
  