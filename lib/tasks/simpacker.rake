namespace :assets do
  task :precompile do
    sh 'NODE_ENV=production npm run build'
  end
end
