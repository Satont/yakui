<template>
  <aside class="menu_site">
    <div class="logo_site">
      <Logo />
    </div>
    <div class="menu_site-nav">
      <ul>
        <router-link to="/" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <home-icon size="24" class="custom-class"></home-icon>
        </router-link>
        <router-link to="/dashboard" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <award-icon size="24" class="custom-class"></award-icon>
        </router-link>
        <router-link to="/events" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <box-icon size="24" class="custom-class"></box-icon>
        </router-link>
        <router-link to="/greetigs" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <clock-icon size="24" class="custom-class"></clock-icon>
        </router-link>
        <router-link to="/integrations" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <users-icon size="24" class="custom-class"></users-icon>
        </router-link>
        <router-link to="/keywords" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <key-icon size="24" class="custom-class"></key-icon>
        </router-link>
        <router-link to="/markers" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <activity-icon size="24" class="custom-class"></activity-icon>
        </router-link>
        <router-link to="/overlays" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <smile-icon size="24" class="custom-class"></smile-icon>
        </router-link>
        <router-link to="/timers" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <anchor-icon size="24" class="custom-class"></anchor-icon>
        </router-link>
        <router-link to="/users" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <grid-icon size="24" class="custom-class"></grid-icon>
        </router-link>
        <router-link to="/variables" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <terminal-icon size="24" class="custom-class"></terminal-icon>
        </router-link>
        <router-link to="/settings" tag="li" class="menu_site-item" exact-active-class="active_menu">
          <settings-icon size="24" class="custom-class"></settings-icon>
        </router-link>
      </ul>
    </div>
    <div class="menu_site-profile" id="profile-popover">
      <Profile />
      <ProfilePopover />
    </div>
  </aside>
</template>

<script lang='ts'>
import {
  HomeIcon,
  AwardIcon,
  BoxIcon,
  TerminalIcon,
  SettingsIcon,
  ClockIcon,
  UsersIcon,
  KeyIcon,
  ActivityIcon,
  SmileIcon,
  AnchorIcon,
  GridIcon,
} from 'vue-feather-icons'
import { Vue, Component } from 'vue-property-decorator'

import Logo from '../assets/icons/Logo.svg'
import Profile from '../assets/icons/Profile.svg'
import ProfilePopover from './ProfilePopover.vue'

@Component({
  name: 'Sidebar',
  components: {
    Logo,
    Profile,
    HomeIcon,
    AwardIcon,
    BoxIcon,
    TerminalIcon,
    ClockIcon,
    UsersIcon,
    KeyIcon,
    ActivityIcon,
    SmileIcon,
    AnchorIcon,
    GridIcon,
    SettingsIcon,
    ProfilePopover,
  },
})
export default class Sidebar extends Vue {}
</script>

<style scoped>
.menu_site {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #121212;
  position: fixed;
  min-height: 100%;
  width: 47px;
  z-index: 9999;
  top: 0;
  left: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
}

.menu_site-nav {
  margin-top: 55px;
  color: #a9a9a9;
}

.menu_site-nav > ul {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu_site-nav > ul > li {
  margin: 8px;
  cursor: pointer;
}

.menu_site-item {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu_site-item > a:hover {
  color: #fff;
}

.menu_site > div:last-of-type {
  margin-top: auto;
}

.menu_site-profile {
  padding-bottom: 24px;
}

.active_menu {
  color: #fff;
  background: rgb(30, 30, 30);
  border-radius: 4px;
}

.logo_site {
  margin-top: 16px;
}
</style>
