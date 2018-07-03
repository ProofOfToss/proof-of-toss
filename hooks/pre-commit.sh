#!/usr/bin/env bash

echo 'Run ESLint on staged files...'

# specify success code
ESLINT_EXIT_CODE=0

# join list of staged files with space
files=`git diff --cached --name-only | grep -E '\.(js|jsx)$' | paste -sd " " -`

# if any .js|.jsx files are staged run eslint
if [ ${#files} -ne 0 ]; then
  node_modules/.bin/eslint --max-warnings 0 $files
fi

if [ $? -ne 0 ]; then
  # override success code to failule
  let ESLINT_EXIT_CODE=1
fi

if [[ ${ESLINT_EXIT_CODE} -ne 0 ]]; then
  echo 'ESLint detected syntax problems. Commit aborted.'
else
  echo 'ESLint checks passed.'
fi

exit ${ESLINT_EXIT_CODE}