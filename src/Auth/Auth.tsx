import { WebAuth, Auth0UserProfile, Auth0Error, Auth0DecodedHash } from 'auth0-js';
import { AUTH_CONFIG } from './auth0-variables';

class Auth {
  tokenRenewalTimeout: NodeJS.Timer;
  userProfile: Auth0UserProfile;
  auth0 = new WebAuth({
    ...AUTH_CONFIG,
    responseType: 'token id_token',
    scope: 'openid profile',
  });

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {

    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        location.href = '/home';
      } else if (err) {

        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  setSession(authResult: Auth0DecodedHash) {
    if (authResult) {

      const { expiresIn, accessToken, idToken } = authResult;

      if (expiresIn && accessToken && idToken) {
        // Set the time that the access token will expire at
        let expiresAt = JSON.stringify(
          expiresIn * 1000 + new Date().getTime()
        );

        // Store auth info in localStorage - sketch?
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('id_token', idToken);
        localStorage.setItem('expires_at', expiresAt);

        // schedule a token renewal
        this.scheduleRenewal();

        // navigate to the home route
        location.href = '/home';
      }
    }
    // Should throw error if no expires in
  }

  getAccessToken() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No access token found');
    }
    return accessToken;
  }

  getProfile = (cb: (err: Auth0Error | null, result?: Auth0UserProfile) => void) => {
    let accessToken = this.getAccessToken();
    // let self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        this.userProfile = profile;
      }
      cb(err, profile);
    });
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('scopes');
    // this.userProfile = null;

    clearTimeout(this.tokenRenewalTimeout);
    // logout use form the auth0
    // location.href = `https://${AUTH_CONFIG.domain}/v2/logout?returnTo=${AUTH_CONFIG.redirectUrl}/
    // &client_id=${AUTH_CONFIG.clientId}`;
    location.href = '/';
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let time = localStorage.getItem('expires_at') || '';
    let expiresAt = time ? JSON.parse(time) : new Date().getTime();
    return new Date().getTime() < expiresAt;
  }

  renewToken() {
    this.auth0.checkSession({}, (err: Auth0Error, result: Auth0DecodedHash) => {
      if (err) {
        alert(
          `Could not get a new token (${err.error}: ${err.errorDescription}).`
        );
      } else {
        this.setSession(result);
        alert(`Successfully renewed auth!`);
      }
    });
  }

  scheduleRenewal() {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '');
    const delay = expiresAt - Date.now();
    if (delay > 0) {
      this.tokenRenewalTimeout = setTimeout(() => {
        this.renewToken();
      }, delay);
    }
  }

  checkSSO(cb: (err: Auth0Error, result: Auth0DecodedHash) => void) {
    this.auth0.checkSession({}, (err: Auth0Error, result: Auth0DecodedHash) => {
      if (err) {
        alert(`Could not get a new token (${err.error}: ${err.errorDescription}).`);
      } else {
        this.setSession(result);
      }
      cb(err, result);
    });
  }
}

export default Auth;
