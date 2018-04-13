#!/bin/bash
## Generates the HTML pages for the web site
## DEV_HOME should be set to the location of the Go lang software
## CNREADER_HOME should be set to the location of the staging system
export WEB_DIR=web-staging
export TEMPLATE_HOME=html/material-templates
mkdir $WEB_DIR
mkdir $WEB_DIR/analysis
mkdir $WEB_DIR/analysis/articles
mkdir $WEB_DIR/analysis/erya
mkdir $WEB_DIR/analysis/laoshe
mkdir $WEB_DIR/analysis/liji
mkdir $WEB_DIR/analysis/lunyu
mkdir $WEB_DIR/analysis/shiji
mkdir $WEB_DIR/analysis/shuowen
mkdir $WEB_DIR/analysis/sishuzhangju
mkdir $WEB_DIR/analysis/yeshengtao
mkdir $WEB_DIR/analysis/zhuangzi
mkdir $WEB_DIR/articles
mkdir $WEB_DIR/erya
mkdir $WEB_DIR/images
mkdir $WEB_DIR/laoshe
mkdir $WEB_DIR/liji
mkdir $WEB_DIR/lunyu
mkdir $WEB_DIR/mp3
mkdir $WEB_DIR/script
mkdir $WEB_DIR/shiji
mkdir $WEB_DIR/shuowen
mkdir $WEB_DIR/sishuzhangju
mkdir $WEB_DIR/words
mkdir $WEB_DIR/yeshengtao
mkdir $WEB_DIR/zhuangzi

if [ -n "$DEV_HOME" ]; then
  echo "Running from $DEV_HOME"
  if [ -n "$CNREADER_HOME" ]; then
    cd $CNREADER_HOME
    cd $DEV_HOME/go
    source 'path.bash.inc'
    cd src/cnreader
  	./cnreader
    ./cnreader -hwfiles
    ./cnreader -html
    cp web-resources/*.css $WEB_DIR/.
    cp web-resources/script/*.js $WEB_DIR/script/.
    cp web-resources/images/*.* $WEB_DIR/images/.
    cp corpus/images/*.* $WEB_DIR/images/.
  else
    echo "CNREADER_HOME is not set"
    exit 1
  fi
else
  echo "DEV_HOME is not set"
  exit 1
fi