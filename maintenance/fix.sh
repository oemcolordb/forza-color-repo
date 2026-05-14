#!/bin/sh
GIT_SEQUENCE_EDITOR=true git rebase -i 33bf348 --exec 'git commit --amend --author="xblackxscars123 <xblackxscars123@gmail.com>" --no-edit'
