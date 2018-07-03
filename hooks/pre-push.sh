#!/usr/bin/env bash

echo 'Run ESLint on src...'

# specify success code
ESLINT_EXIT_CODE=0

node_modules/.bin/eslint --max-warnings 0 src

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