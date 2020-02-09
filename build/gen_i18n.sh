#!/bin/sh
index=src/i18n/index.js
rm -f $index
for i in src/i18n/*.json; do
	i=$(basename $i .json)
	echo "exports['$i'] = require('./$i.json');" >> $index
done
