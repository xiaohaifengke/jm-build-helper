ls
node -v
npm -v
pnpm -v
ls
rm -rf temp-cd
mkdir temp-cd
echo "http://liujiahai:={1qvq/[cqKIVKsDc~N/ME5lrlRwk@172.24.141.176:8357/git/yetu_web.git" > \.git-credential
cd temp-cd
git init
git config credential.helper store --file=.git-credential
git remote add origin http://172.24.141.176:8357/git/yetu_web.git
git pull
git checkout devtest
find . ! -path './.git*' ! -name '.' ! -name '..' -exec rm -rf {} +
ls
cp -r ../dist/. .
git add .
git commit -m "devtest"
git push