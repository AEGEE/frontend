<template>
  <div>
    <p>You should now be redirected to the helpdesk.</p>
    <p>If this does not happen, please click <a href="https://myaegee.atlassian.net/servicedesk/customer/portals">here</a>.</p>
  </div>
</template>

<script>
  export default {
    name: 'Helpdesk',
    mounted () {
      window.open('https://myaegee.atlassian.net/servicedesk/customer/portals')
      window.history.go(-1)
    }
  }
</script>
