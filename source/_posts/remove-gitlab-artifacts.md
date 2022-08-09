---
title: Remove old GitLab CI job artifacts
excerpt: Use this script to unlock a repository that has exceeded the 5 GB usage quota
date: 2022-08-09
tags:
- gitlab
---

On 8 Aug 2022, GitLab [announced](https://docs.gitlab.com/ee/user/usage_quotas.html#namespace-storage-limit-enforcement-schedule) they will enforce 5 GB storage quota on free account from 9 November 2022. My [malware-filter](https://gitlab.com/malware-filter) group was using 25.3 GB prior to a cleanup where some projects were more than 5 GB. I did apply malware-filter for GitLab for [Open Source Program](https://about.gitlab.com/solutions/open-source/join/), so I get Ultimate tier with 250 GB storage limit (per project). While I'm still far off from the storage limit, I still went ahead to clean them up in case they reduce storage quota for Open Source Program.

## Expire new job artifacts

In all my projects that were using more than 5 GB, 99% of the usage came from job artifacts. I believe most of the cases are like this. The first thing I did was to set *new* job artifacts to expire in a week, the default is [30 days](https://docs.gitlab.com/ee/user/gitlab_com/index.html#gitlab-cicd). Existing job artifacts are not affected by this setting.

If your job artifacts created in a month are much less than 5 GB in total yet still exceed the quota, it is likely caused by very old artifacts which have no expiry. In that case, reducing the default expiry may not be relevant, those old artifacts should be removed instead.

``` diff .gitlab-ci.yml
build:
  artifacts:
    paths:
      - public/
+    expire_in: 1 week
```

## Remove old job artifacts

As for cleaning up existing job artifacts, I found the following bash script on the GitLab forum. I fixed some variable typo and modified the starting page to "2", all job artifacts will be removed except for the first page, retaining 100 most recent job artifacts. The only dependencies are **curl** and **jq**.

This script is especially useful for removing job artifacts were created before 22 Jun 2020, artifacts created before that date do not expire.

{% codeblock cleanup-gitlab.sh lang:bash https://forum.gitlab.com/t/remove-all-artifact-no-expire-options/9274/12 source %}
#!/bin/bash
# https://forum.gitlab.com/t/remove-all-artifact-no-expire-options/9274/12
# Copyright 2021 "Holloway" Chew, Kean Ho <kean.ho.chew@zoralab.com>
# Copyright 2020 Benny Powers (https://forum.gitlab.com/u/bennyp/summary)
# Copyright 2017 Adam Boseley (https://forum.gitlab.com/u/adam.boseley/summary)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


##############
# user input #
##############
# project ID (Help: goto "Settings" > "General")
projectID=""

# user API token (Help: "User Settings" > "Access Tokens" > tick "api")
token=""

# gitlab server instance
server="gitlab.com"

# CI Jobs pagination (Help: "CI/CD" > "Jobs" > see bottom pagination bar)
#
# NOTE: user interface might be bug. If so, you need to manually calculate.
# By default, maximum 10,000 (end_page * per_page) job artifacts will be removed, while retaining 100 most recent artifacts.
# Example:
#   1. For 123 jobs in the past and per_page is "100" (maximum), it has 2 pages (end_page) in total
#      [end_page = ROUND_UP(total_job / per_page)].
#   2. To retain most recent 200 jobs
#      [start_page = num_job_retain / per_page + 1]
start_page="2"
end_page="100"
per_page="100"

# GitLab API version
api="v4"

#####################
# internal function #
#####################
delete() {
  # page
  page="$1"
  1>&2 printf "Cleaning page ${page}...\n"

  # build internal variables
  baseURL="https://${server}/api/${api}/projects"

  # get list from servers for the page
  url="${baseURL}/${projectID}/jobs/?page=${page}&per_page=${per_page}"
  1>&2 printf "Calling API to get lob list: ${url}\n"

  list=$(curl --globoff --header "PRIVATE-TOKEN:${token}" "$url" \
          | jq -r ".[].id")
  if [ ${#list[@]} -eq 0 ]; then
          1>&2 printf "list is empty\n"
          return 0
  fi

  # remove all jobs from page
  for jobID in ${list[@]}; do
          url="${baseURL}/${projectID}/jobs/${jobID}/erase"
          1>&2 printf "Calling API to erase job: ${url}\n"

          curl --request POST --header "PRIVATE-TOKEN:${token}" "$url"
          1>&2 printf "\n\n"
  done
}

main() {
  # check dependencies
  if [ -z $(type -p jq) ]; then
          1>&2 printf "[ ERROR ] need 'jq' dependency to parse json."
          exit 1
  fi

  # loop through each pages from given start_page to end_page inclusive
  for ((i=start_page; i<=end_page; i++)); do
          delete $i
  done

  # return
  exit 0
}
main $@
{% endcodeblock %}

## Before & after

Project | Before | After | Runtime
--- | --- | --- | ---
[malware-filter](https://gitlab.com/malware-filter/malware-filter) (project) | 15.12 GB | 6.3 GB | 46m 15s
[phishing-filter](https://gitlab.com/malware-filter/phishing-filter) | 6.02 GB | 949 MB | 1h 35m 17s
[pup-filter](https://gitlab.com/malware-filter/pup-filter) | 1.16 GB | 480.4 MB | 57m 45s
[tracking-filter](https://gitlab.com/malware-filter/tracking-filter) | 106.68 MB | 105.3 MB | 4m 38s
[urlhaus-filter](https://gitlab.com/malware-filter/urlhaus-filter) | 2.64 GB | 908 MB | 1h 50m 19s
[vn-badsite-filter](https://gitlab.com/malware-filter/vn-badsite-filter) | 283.12 MB | 114.8 MB | 19m 52s
