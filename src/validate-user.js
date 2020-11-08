const RESTRICTED_EMAILS = ['aegee.org', 'aegee.eu']
const ALLOWED_BODY_TYPES = ['antenna', 'contact antenna', 'contact']

const validate = (user) => {
  if (user.superadmin) {
    return {}
  }

  const errorsMap = {}
  if (RESTRICTED_EMAILS.some(email => user.email.endsWith(email))) {
    errorsMap.email = 'Cannot use @aegee.org or @aegee.eu emails.'
  }

  if (!user.bodies.some(body => ALLOWED_BODY_TYPES.includes(body.type))) {
    errorsMap.bodies = 'Should have at least 1 local.'
  }

  if (!user.privacy_consent) {
    errorsMap.privacy = 'Should agree to the Privacy Policy.'
  }

  return errorsMap
}

export {
  validate,
  RESTRICTED_EMAILS,
  ALLOWED_BODY_TYPES
}
