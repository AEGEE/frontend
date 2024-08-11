<template>
    <div class="modal-card" style="height: 75vh">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ local.name }}</p>
        <button class="delete" aria-label="close" @click="$parent.close()" />
      </header>
  
      <section class="modal-card-body">
  
      </section>

      <footer class="modal-card-foot">

      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AntennaCriteriaInfo',
    props: ['local', 'agora', 'services', 'showError', 'showSuccess', 'router'],
    
  }
  
  </script>
  