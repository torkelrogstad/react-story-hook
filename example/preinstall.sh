#! /usr/bin/env sh
# https://github.com/facebook/react/issues/14257#issuecomment-595183610

LINK_FOLDER=$(mktemp --directory)
YARN_LINK="yarn link --link-folder $LINK_FOLDER"
PACKAGE_NAME=react-story-hook

cd .. 
$YARN_LINK

cd node_modules/react
$YARN_LINK

cd ../react-dom
$YARN_LINK

cd ../../example
$YARN_LINK $PACKAGE_NAME
$YARN_LINK react
$YARN_LINK react-dom