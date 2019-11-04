module.exports = {
    mongoURI: `mongodb+srv://heroku:${encodeURI('DJFhhN4wBvyCSBF')}@matcha-t0bsj.gcp.mongodb.net/test?retryWrites=true&w=majority`,
    googleClientID: '834503721968-tlctks702gd1jpe79a54nikpca8rpf22.apps.googleusercontent.com',
    googleClientSecret: 'kXAM2MDGtbX-0boag1lYsepo',
    googleCallbackURI: '/auth/google/callback',
    googlePlacesAPIKEY: 'AIzaSyDBelS4b_53qBFkXKPfHQ-TBTRYvFm-x6w',
    instagramAppID: '528947177885690',
    instagramClientSecret: '5797a81005452fe046c393339385ec0e',
    instagramRedirectURI: 'https://localhost:5000/auth/instagram/redirect',
    instagramWindow: `https://api.instagram.com/oauth/authorize?app_id=528947177885690&redirect_uri=https%3A%2F%2Flocalhost%3A5000%2Fauth%2Finstagram%2Fredirect&scope=user_profile,user_media&response_type=code&state=1`
}