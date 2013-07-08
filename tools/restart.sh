#!/bin/sh

stop scrollback
npm install
./build.sh
start scrollback
