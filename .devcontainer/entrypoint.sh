#!/bin/sh

WORKSPACE_FOLDER=$1

git config --global --add safe.directory $WORKSPACE_FOLDER
