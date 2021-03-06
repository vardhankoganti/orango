<template>
  <v-toolbar app flat dense clipped-left color="toolbar" class="elevation-1">
    <logo class="clickable hidden-sm-and-down" @click.native="$router.push({name: 'home'})"></logo>
    <v-spacer class="hidden-sm-and-down"></v-spacer>
    <toolbar-link></toolbar-link>
    <v-spacer></v-spacer>
    <v-menu v-if="authUser" offset-y right>
      <avatar :user="authUser" slot="activator"></avatar>
      <v-card>
        <v-list>
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <avatar :user="authUser"></avatar>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{authUser.firstName}} {{authUser.lastName}}</v-list-tile-title>
              <v-list-tile-sub-title>Joined {{authUser.created | date("M Y")}}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-divider></v-divider>

        <v-list dense>
          <v-list-tile v-for="item in items" :key="item.title" :to="{ name: 'tweets', params: { handle: authUser.screenName }}">
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn block depressed color="primary" @click="_logout">Logout</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
    <v-btn v-show="authUser" round depressed color="primary" class="tweet-btn hidden-sm-and-down" @click="tweet()">
      Chirp
    </v-btn>
    <v-btn v-if="!authUser" flat round :to="{name: 'login'}">Have an account?&nbsp;<strong>Log in</strong></v-btn>
  </v-toolbar>
</template>

<style lang="stylus" scoped>
.v-list__tile__title
  color #666
</style>


<script>
import { mapState, mapActions } from 'vuex'
import bus from '@/helpers/bus'
import Avatar from '@/components/Avatar'
import ToolbarLink from '@/components/ToolbarLink'
import Logo from '@/components/Logo'

export default {
  components: {
    Avatar,
    ToolbarLink,
    Logo
  },
  data() {
    return {
      items: [{ title: 'My Profile' }]
    }
  },
  computed: {
    ...mapState('auth', ['accessToken', 'authUser']),
    showMenu() {
      return !!this.authUser
    },
    userInitial() {
      return this.authUser.firstName.substr(0, 1)
    }
  },
  methods: {
    ...mapActions('auth', ['logout']),
    _logout() {
      this.logout()
      this.$router.push({ name: 'login' })
    },
    tweet() {
      bus.$emit('tweet')
    }
  }
}
</script>
