<template>
  <section class="app-main" data-cy="app-main" :style="[hiddenSidebarStyle]" :class="{ 'is-menu-opened': navbar.menuOpened }">
    <div class="container is-fluid is-marginless app-content">
      <levelbar />
      <transition
        mode="out-in"
        enter-active-class="fadeIn"
        leave-active-class="fadeOut"
        appear>
        <div class="box">
          <router-view class="animated" />
        </div>
      </transition>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import Levelbar from './Levelbar'

export default {
  computed: {
    ...mapGetters({
      sidebar: 'sidebar',
      navbar: 'navbar'
    }),
    hiddenSidebarStyle () {
      return this.sidebar.opened ? null : { 'margin-left': 0 }
    }
  },
  components: {
    Levelbar
  }
}
</script>

<style lang="scss">
@import "../../styles/main.scss";

html {
  background-color: #fafafa;
}

.app-main {
  padding-top: 50px;
  margin-left: 180px;
  transform: translate3d(0, 0, 0);

  @include mobile() {
    margin-left: 0;
  }

  &.is-menu-opened {
    @include mobile() {
      padding-top: 200px
    }

    @include tablet-only() {
      padding-top: 200px
    }
  }
}

.app-content {
  padding: 20px;
}
</style>
