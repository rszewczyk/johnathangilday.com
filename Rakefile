
desc "deletes the Jekyll _site folder"
task :clean do
  puts "deleting _site"
  system('rm -r _site')
  puts "deleted"
end

desc "builds _site"
task :build => :clean do
  puts "building _site"
  system('jekyll')
  puts "complete"
end

desc "deploys test site at localhost:4000"
task :dev => :clean do
  puts "building and deploying"
  system('jekyll --server --auto')
  puts "running at localhost:4000 will auto update changes"
end

desc "deploys to johnathangilday.com"
task :deploy => :build do
  puts "building and copying to johnathangilday.com"
  system('rsync -avrz --delete _site/ johnath1@johnathangilday.com:public_html')
end
