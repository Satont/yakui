<template>
  <header class="header_site">
    <div class="header_site-information">
      <div class="information">
        Viewers:
        <span class="information_value">1456</span>
      </div>
      <div class="information">
        Views:
        <span class="information_value">10 474 560</span>
      </div>
      <div class="information">
        Uptime:
        <span class="information_value">Currently Offline</span>
      </div>
      <div class="information">
        Category:
        <span class="information_value">Call of Duty: Modern Warfare</span>
      </div>
      <div class="information">
        Title:
        <span class="information_value">ОБЗОР НА CALL OF DUTY MODERN WARFARE / !CONTEST — КОНКУРС НА СКИНЫ</span>
      </div>
    </div>
  </header>
</template>

<script>
export default {}
</script>

<style scoped>
.header_site {
  display: flex;
  align-items: center;
  position: sticky;
  background-color: #121212;
  width: 100% !important;
  top: 0;
  right: 0;
  left: 0;
  z-index: 9998;
  padding-left: 64px;
  height: 47px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.header_site-information {
  display: flex;
  flex-wrap: wrap;
}

.information {
  padding-right: 16px;
  color: #a9a9a9;
  font-size: 12px;
  font-weight: bold;
}

.information_value {
  color: #fff;
}
</style>
