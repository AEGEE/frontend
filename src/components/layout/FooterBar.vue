<template>
  <footer class="footer">
    <div class="container">
      <div class="content has-text-centered">
        <p>
          <router-link :to="{ name: 'oms.confluence', params: { page_id: 'terms-of-service' } }">Legal info</router-link> &bull;
          <router-link :to="{ name: 'oms.about' }">About MyAEGEE</router-link> &bull;
          <router-link :to="{ name: 'oms.bug_report' }">Report a bug!</router-link>
        </p>
        <p>© 2017-{{ year }} <a href="//aegee.org" target="_blank" rel="noopener noreferrer">AEGEE-Europe</a> &bull;
          Powered by <a href="//myaegee.atlassian.net/wiki/spaces/GENERAL" target="_blank" rel="noopener noreferrer">Online Membership System</a></p>
      </div>

      <article class="footer-message message is-danger">
        <div class="message-header">
          <p>DEBUG BUILD</p>
        </div>
        <div class="message-body">
          <strong>All data is volatile and can be reverted at any time!</strong>
        </div>
      </article>
    </div>
  </footer>
</template>

<script>
import moment from 'moment'

export default {
  data () {
    return {
      pkg: this.$store.state.pkg,
      year: moment().format('YYYY')
    }
  }
}
</script>

<style lang="scss">
@import "~bulma/sass/utilities/initial-variables";
@import "~bulma/sass/utilities/derived-variables";
@import '~bulma/sass/utilities/mixins';

.footer {
  margin-left: 180px;
  padding: 1rem 1.5rem 1rem !important;

  @include mobile() {
    margin-left: 0;
  }

  .footer-message {
    display: none;
    border: 1px solid #ff3860;
  }

  .social a {
    border-bottom: none !important;
  }

  .fa.fa-heart {
    color: red;
  }
}
</style>
