<template>
  <div id="app">
    <!-- <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/brand-list">品牌列表</router-link>
      <router-link to="/membership">会员中心</router-link>
      <router-link to="/profile">个人中心</router-link>
    </nav> -->
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
nav {
  padding: 10px;
  display: flex;
  gap: 15px;
  background-color: #f5f5f5;
}

nav a {
  text-decoration: none;
  color: #333;
}

nav a.router-link-active {
  color: #42b983;
  font-weight: bold;
}

main {
  /* padding: 20px; */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
