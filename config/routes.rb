Rails.application.routes.draw do
  get "/about", to: 'locations#about', as: 'about'
  get "/touring", to: 'locations#touring_info', as: 'touring'

  get '/:locale' => 'locations#index', as: :switch
  root 'locations#index'
  post "/locations/create", to: 'locations#create'
  get "/locations/nodes", to: 'locations#retrieve_nodes'

  resources :users do
    resources :locations,         only: [:destroy]
  end

  resources :account_activations, only: [:edit]
  resources :password_resets,     only: [:new, :create, :edit, :update]

  get "auth/github/callback" => 'sessions#create'
  get "auth/google_oauth2/callback" => 'sessions#create'
  get "auth/facebook/callback" => 'sessions#create'

  get "auth/:provider" => 'sessions#create', as: 'provider_login'
  post   "/login",  to: 'sessions#create', as: 'login'
  delete "/logout", to: 'sessions#destroy'



end
