#!/usr/bin/env python
import argparse
import subprocess
import sys
import string
import os
import collections

def printSeparator():
    print ""
    print "=================================================================================="
    print "=================================================================================="

def printErrorIfItExists(errorText):
    if len(errorText) > 0:
        print "[ERROR] " + errorText
        sys.exit(1)

def checkIfTheTreeIsClean(text):
    if ("nothing to commit, working directory clean" not in text and
        "nothing to commit, working tree clean" not in text):
        printErrorIfItExists('You can not use this script, because you have uncommitted changes.')

def checkIfPushIsSuccessful(text):
    return "failed" not in text

def everythingIsUpToDate(text):
    return "Everything up-to-date" in text

def fetchIsSuccessful(text):
    return "error" not in text

def checkBranchStatus(branch):
    print "[INFO] Getting status of branch " + branch

    statusProcess = subprocess.Popen(['git', 'status'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    statusOut, statusErr = statusProcess.communicate()

    printErrorIfItExists(statusErr)
    checkIfTheTreeIsClean(statusOut)

    print "[SUCCESS] " + statusOut
    print ""

def checkoutBranch(branch):
    print "[INFO] Checking out branch " + branch
    subprocess.call(['git', 'checkout', '--progress', branch])

def mergeBranch(branch, targetBranch):
    print "[INFO] Merging branch " + branch

    mergeMsg = 'Merged ' + branch + ' into ' + targetBranch + ' [ci skip]'
    mergeProcess = subprocess.Popen(['git', 'merge', '--progress', '--no-ff', '-m', mergeMsg, branch], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    mergeOut, mergeErr = mergeProcess.communicate()

    printErrorIfItExists(mergeErr)
    print "[SUCCESS] " + mergeOut
    print ""

def pushBranch(branch):
    print "[INFO] Pushing updates to remote branch " + mergedBranch
    pushProcess = subprocess.Popen(['git', 'push', '--progress', 'origin', mergedBranch], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    pushOut, pushErr = pushProcess.communicate()

    # Git sends debug info to stderr, so need firstly to check if everything is up-to-date
    # and secondly if push had no errors (keyword "failed").
    if everythingIsUpToDate(pushErr) == True or checkIfPushIsSuccessful(pushErr) == True:
        print "[SUCCESS] " + pushOut + pushErr
        print ""
    else:
        printErrorIfItExists(pushErr)

def printLatestHash(branch):
    print "[INFO] Getting the latest hash of branch " + branch
    revParseProcess = subprocess.Popen(['git', 'rev-parse', branch], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    revParseOut, revParseErr = revParseProcess.communicate()

    printErrorIfItExists(revParseErr)
    print "[SUCCESS] The latest hash of branch " + branch + " is " + revParseOut
    print ""

def denormalizeVersionNumber(normalizedVersion):
    version = string.split(normalizedVersion, '.')
    mult = 10000

    if len(version) != 3:
        printErrorIfItExists('Version must consist of major/minor/patch numbers.')

    return int(version[0]) * mult * mult + int(version[1]) * mult + int(version[2])

def checkoutReleaseBranches():
    proc = subprocess.Popen(['git', 'branch', '--list', 'release/*'], stdout=subprocess.PIPE)
    localBranches = map(str.strip, proc.stdout.readlines())
    proc = subprocess.Popen(['git', 'branch', '--list', '-r', 'origin/release/*'], stdout=subprocess.PIPE)
    remoteBranches = []
    for branch in proc.stdout.readlines():
        remoteBranches.append(branch.strip()[7:])

    missingBranches = list(set(remoteBranches) - set(localBranches))
    for branch in missingBranches:
        checkoutBranch(branch)

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Recursively updates release branches using semantic versioning.')
    parser.add_argument('release', help='Release number to take changes from')
    parser.add_argument('--checkout-branches', action='store_true',
                        help='Checkout all known release branches from remote before update.')
    args = parser.parse_args()

    sourceBranch = 'release/' + args.release
    sourceVersion = denormalizeVersionNumber(args.release)

    printSeparator()
    checkoutBranch(sourceBranch)
    checkBranchStatus(sourceBranch)

    printSeparator()
    print "[INFO] Fetching updates from remote repository"
    fetchProcess = subprocess.Popen(['git', 'fetch', '--progress'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    fetchOut, fetchErr = fetchProcess.communicate()

    # Git sends debug info to stderr, so need to check manually if there were no errors.
    if fetchIsSuccessful(fetchErr):
        print "[SUCCESS] " + fetchOut + fetchErr
        print ""
    else:
        printErrorIfItExists(fetchErr)

    if args.checkout_branches:
        checkoutReleaseBranches()
        checkoutBranch(sourceBranch)
        checkBranchStatus(sourceBranch)

    printLatestHash(sourceBranch)
    printLatestHash('origin/' + sourceBranch)

    mergeBranch('origin/' + sourceBranch, sourceBranch)

    print "[INFO] Getting list of branches "
    branchesProcess = subprocess.Popen(['git', 'branch'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    branchesOut, branchesErr = branchesProcess.communicate()

    printErrorIfItExists(branchesErr)
    print "[SUCCESS]" + branchesOut
    print ""

    branches = string.split(branchesOut, os.linesep)
    sortedBranches = {}
    mergedBranches = []

    for targetBranch in branches:
        targetBranch = targetBranch.strip()

        if targetBranch.startswith('release/') == False:
            continue

        printLatestHash(targetBranch)
        printLatestHash('origin/' + targetBranch)

        targetVersion = string.split(targetBranch, '/')
        targetVersion = denormalizeVersionNumber(targetVersion[1])

        sortedBranches[targetVersion] = targetBranch

    sortedBranches = collections.OrderedDict(sorted(sortedBranches.items()))

    for i, (targetVersion, targetBranch) in enumerate(sortedBranches.items()):
        if targetVersion <= sourceVersion:
            continue

        printSeparator()
        checkoutBranch(targetBranch)
        checkBranchStatus(targetBranch)

        mergeBranch('origin/' + targetBranch, targetBranch)
        mergeBranch(sourceBranch, targetBranch)

        mergedBranches.append(targetBranch)
        sourceBranch = targetBranch
        sourceVersion = targetVersion

    printSeparator()
    print "[INFO] Pushing merged branches..."

    for mergedBranch in mergedBranches:
        checkoutBranch(mergedBranch)
        pushBranch(mergedBranch)
