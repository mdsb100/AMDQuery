type node > /dev/null 2>&1
if [ $? != 0 ]; then
    echo "you should install node"
    exit
fi

type jsdoc > /dev/null 2>&1
if [ $? != 0 ]; then
    echo "you should invoke: sudo npm install -g git://github.com/jsdoc3/jsdoc.git"
    exit
fi

jsdoc ../amdquery --template templates/default --destination ./../document/api/