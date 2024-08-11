<template>
  <div class="modal-card" style="height: 75vh">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ local.name }}</p>
      <button class="delete" aria-label="close" @click="$parent.close()" />
    </header>
  
    <section class="modal-card-body">
      <div v-for="(value, key) in this.local.comments" :key="key">
        <span v-if="value != '' & value != null">
          <strong>{{ key.charAt(0).toUpperCase() + key.slice(1) }}: </strong>
          {{ value }}
        </span>
      </div>
    </section>

    <footer class="modal-card-foot">

    </footer>
  </div>
</template>
  
<script>
export default {
  name: 'AntennaCriteriaInfo',
  props: ['local', 'agora', 'services', 'showError', 'showSuccess', 'router'],
  mounted () {
    this.isLoading = true
    console.log(this.local.comments)
    this.isLoading = false
  }
}
  
</script>
