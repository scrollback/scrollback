for i in *.js # or whatever other pattern...
do
  if ! grep -q Copyright $i
  then
    cat ~/dev/scrollback/tools/license.js $i >$i.new && mv $i.new $i
	echo Added to $i
  fi
done
