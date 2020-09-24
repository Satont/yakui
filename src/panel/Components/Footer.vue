<template>
  <footer class="footer_site">
    <div class="footer_site-link">
      <div class="footer_socials-list">
        <div class="footer_site-btn"><Gitlab class="footer_icon-social" /> sad_satont</div>
        <div class="footer_site-btn"><Github class="footer_icon-social" /> sad_satont</div>
        <div class="footer_site-btn"><Slack class="footer_icon-social" /> sad_satont</div>
      </div>
      <div class="footer_site-btn-widget" v-if="$route.path === '/'">
        <button
          type="button"
          class="btn-widget"
          data-container="body"
          data-toggle="popover"
          data-placement="top"
          data-content="<div>Тут нужно сделать меню<div>"
        >
          <Plus class="icon-add" />

          Add new widget
        </button>
      </div>
    </div>
  </footer>
</template>

<script>
import Github from '../assets/icons/Github.svg'
import Gitlab from '../assets/icons/Gitlab.svg'
import Slack from '../assets/icons/Slack.svg'
import Plus from '../assets/icons/Plus.svg'

export default {
  name: 'Footer',
  components: {
    Github,
    Gitlab,
    Slack,
    Plus,
  },
}
</script>

<style scoped>
.footer_site {
  position: absolute;
  bottom: 25px;
  left: 0;
  right: 0;
}

.footer_site-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer_socials-list {
  display: flex;
  margin-left: 16px;
}

.footer_site-btn {
  display: flex;
  align-items: center;
  font-size: 12px;
  padding-left: 8px;
  width: 104px;
  height: 24px;
  color: #2f2f2f;
  stroke: #2f2f2f;
}

.footer_site-btn:hover {
  background-color: #1e1e1e;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: ease-in-out 0.2s;
  stroke: #fff;
}

.footer_icon-social {
  color: #2f2f2f;
  margin-right: 7px;
}

.btn-widget {
  display: flex;
  outline: none;
  border: none;
  justify-content: space-around;
  align-items: center;
  font-size: 11px;
  font-weight: bold;
  background-color: #6c43b5;
  width: 143px;
  height: 40px;
  color: #fff;

  border-radius: 4px;
  transition: ease-in-out 0.2s;
}

.btn-widget:hover {
  background-color: #7d56c0;
}

.btn-widget:focus {
  background-color: #7137cf;
}
</style>
