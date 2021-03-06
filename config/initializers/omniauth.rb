Rails.application.config.middleware.use OmniAuth::Builder do
  provider :github, ENV["GITHUB_CLIENT_ID"], ENV["GITHUB_CLIENT_SECRET"]
  provider :google_oauth2, ENV["GOOGLE_CLIENT_ID"], ENV["GOOGLE_CLIENT_SECRET"]
  provider :facebook, ENV["FACEBOOK_CLIENT_ID"], ENV["FACEBOOK_CLIENT_SECRET"],
    :scope => 'email', :display => 'popup', :info_fields => 'name,email'
end
