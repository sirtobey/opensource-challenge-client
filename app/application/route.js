import Ember from 'ember'
import ApplicationRouteMixin
  from 'ember-simple-auth/mixins/application-route-mixin'
import LoginValidations from '../validations/login'

const { Route, inject } = Ember

export default Route.extend(ApplicationRouteMixin, {
  LoginValidations,

  ajax: inject.service(),
  torii: inject.service(),
  currentUser: inject.service(),

  beforeModel() {
    return this._loadCurrentUser()
  },

  sessionAuthenticated() {
    this._super(...arguments)

    this._loadCurrentUser()
  },

  async _loadCurrentUser() {
    try {
      return this.get('currentUser').load()
    }
    catch (err) {
      this.session.invalidate()
    }
  },

  async _toriiLogin(provider) {
    try {
      let { authorizationCode } = await this.get('torii').open(provider)

      return this.session.authenticate('authenticator:osc', {
        provider,
        authorizationCode
      })
    }
    catch (err) {
      this.transitionTo('error', err)
    }
  },

  actions: {
    async login(data) {
      await data.validate()

      if (data.get('isValid')) {
        return this.session.authenticate('authenticator:osc', {
          username: data.get('email'),
          password: data.get('password')
        })
      }
    },
    loginWithGoogle() {
      return this._toriiLogin('google')
    },
    loginWithGithub() {
      return this._toriiLogin('github')
    },
    logout() {
      return this.session.invalidate()
    }
  }
})
