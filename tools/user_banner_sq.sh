#!/bin/bash

base=`dirname $(readlink -e $0)`
name="$1"
records=$2
species=$3
output="$4"

composite \
  -background transparent \
  pango:"<span foreground='#777'><big>$name</big>\n<b>$records</b> të dhëna\n<b>$species</b> lloj</span>" \
  -geometry +22+18 \
  $base/user_banner_bg.png \
  "$output"
