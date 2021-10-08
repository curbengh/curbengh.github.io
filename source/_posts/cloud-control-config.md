---
title: 'Managing inventory: AWS Cloud Control vs Config'
excerpt: List AWS resources account-level and organisation-level
date: 2021-10-08
tags:
- aws
---

AWS announced a new API called [Cloud Control](https://aws.amazon.com/blogs/aws/announcing-aws-cloud-control-api/) that provides a standard sets of APIs to manage AWS resources. Imagine running `aws cloudcontrol create-resource` to launch EC2 and Lambda, instead of using `aws ec2 run-instances` and `aws lambda create-function`.

Aside from CRUD operations, it also supports List operation to discover all deployed resources filtered by a specific resource type (e.g. `AWS::ECS::Cluster`). When I first read the announcement, I wonder how it compares to {% post_link aws-config 'AWS Config' %}, a feature I'm actively using mainly for security audit, but it could also perform inventory task.

Since Cloud Control is a recent feature, the latest library is required. For Python library, I ran `pip install boto3 --upgrade` to update it to version xxx. Then, I created a minimal Python script to test out Cloud Control's [ListResources](https://docs.aws.amazon.com/cloudcontrolapi/latest/APIReference/API_ListResources.html).

``` py
#!/usr/bin/env python

# ./cloud-control.py --profile profile-name --region region-name

from argparse import ArgumentParser
import boto3
from botocore.config import Config
from itertools import count
from json import dump, loads

parser = ArgumentParser(description = 'Find the latest AMIs.')
parser.add_argument('--profile', '-p',
  help = 'AWS profile name. Parsed from ~/.aws/config (SSO) or credentials (API key).',
  required = True)
parser.add_argument('--region', '-r',
  help = 'AWS Region, e.g. us-east-1',
  required = True)
args = parser.parse_args()
profile = args.profile
region = args.region

session = boto3.session.Session(profile_name = profile)
my_config = Config(region_name = region)
client = session.client('cloudcontrol', config = my_config)

results = []
response = {}

for i in count():
  # https://docs.aws.amazon.com/cloudcontrolapi/latest/APIReference/API_ListResources.html
  params = {
    # https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html
    'TypeName': 'AWS::EC2::FlowLog'
  }
  if i == 0 or 'NextToken' in response:
    if 'NextToken' in response:
      params['NextToken'] = response['NextToken']
    response = client.list_resources(**params)
    results.extend(response['ResourceDescriptions'])
  else:
    break

prop_list = []

# Extract properties only
for ele in results:
  prop_list.append(loads(ele['Properties']))

if len(prop_list) >= 1:
  with open('cloud-control.json', 'w') as w:
    # Save the first dictionary only
    dump(dict(sorted(prop_list[0].items())), w, indent = 2)
```

In the first draft of the script, I noticed that the API doesn't support `AWS::EC2::Instance` yet. It took me a while to troubleshoot until I found [this list](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html) of supported resources. The error wasn't very helpful, e.g. "Resource type AWS::EC2::Instance does not support LIST action". It's more straightforward to just say "Resource type xxx does not support Cloud Control yet".

The announcement did mention not all resources are supported, but I didn't expect AWS' _bread and butter_ are unsupported, including `AWS::S3::Bucket`. I'm sure these resources will be supported eventually, it's just that support of new products are prioritised at the moment as implied from the announcement, "It will support new AWS resources typically on the day of launch".

I tested on `AWS::EC2::PrefixList`, instead of the currently unsupported `AWS::EC2::Instance`. It worked fine, the output syntax is exactly what the documentation outlines. To compare it to Config, I created another equivalent script.

``` py
#!/usr/bin/env python

# ./aws-config.py --profile profile-name --account-id {account-id} --region region-name

from argparse import ArgumentParser
import boto3
from botocore.config import Config
from itertools import count
from json import dump, loads

parser = ArgumentParser(description = 'Find the latest AMIs.')
parser.add_argument('--profile', '-p',
  help = 'AWS profile name. Parsed from ~/.aws/config (SSO) or credentials (API key).',
  required = True)
parser.add_argument('--account-id', '-a',
  help = 'AWS account ID. See ~/.aws/config if SSO is used.',
  required = True,
  type = str)
parser.add_argument('--region', '-r',
  help = 'AWS Region, e.g. us-east-1',
  required = True)
args = parser.parse_args()
profile = args.profile
account_id = args.account_id
region = args.region

session = boto3.session.Session(profile_name = profile)
my_config = Config(region_name = region)
client = session.client('config', config = my_config)

results = []
response = {}

for i in count():
  params = {
    'Expression': "SELECT configuration WHERE resourceType = 'AWS::EC2::FlowLog'" \
      f" AND accountId = '{account_id}'" \
      f" AND awsRegion = '{region}'",
    'ConfigurationAggregatorName': 'ConfigAggregator' # may need to update
  }
  if i == 0 or 'NextToken' in response:
    if 'NextToken' in response:
      params['NextToken'] = response['NextToken']
    response = client.select_aggregate_resource_config(**params)
    results.extend(response['Results'])
  else:
    break


conf_list = []

# Extract configuration only
for ele in results:
  conf_list.append(loads(ele).get('configuration', {}))

if len(conf_list) >= 1:
  with open('aws-config.json', 'w') as w:
    # Save the first dictionary only
    dump(dict(sorted(conf_list[0].items())), w, indent = 2)
```

Before I get to the output comparison, notice the `accountId` and `awsRegion` filters I used in the SQL statement. It's necessary because I'm using an [aggregator](https://docs.aws.amazon.com/config/latest/developerguide/aggregate-data.html) that collects data from **all accounts and regions** in an AWS Organization (which have AWS Config enabled). Like most other AWS APIs, Cloud Control only works on a combination of account and region. If you want discover resources in 5 combinations of account and region, that'll requires 5 API calls, in contrast to just one API call via Config's aggregator.

Here is the output of Cloud Control:

``` json
{
  "DeliverLogsPermissionArn": String,
  "Id": String,
  "LogDestination": String,
  "LogDestinationType": String,
  "LogFormat": String,
  "LogGroupName": String,
  "MaxAggregationInterval": Integer,
  "ResourceId": String,
  "ResourceType": String,
  "Tags": [ Tag, ... ],
  "TrafficType": String
}
```

Config:

``` json
{
  "creationTime": Float,
  "deliverLogsPermissionArn": String,
  "deliverLogsStatus": String,
  "flowLogId": String,
  "flowLogStatus": String,
  "logDestination": String,
  "logDestinationType": String,
  "logFormat": String,
  "logGroupName": String,
  "maxAggregationInterval": Float,
  "resourceId": String,
  "tags": [ Tag, ... ],
  "trafficType": String
}
```

Syntax used by [CloudFormation template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-flowlog.html):

``` json
{
  "DeliverLogsPermissionArn" : String,
  "LogDestination" : String,
  "LogDestinationType" : String,
  "LogFormat" : String,
  "LogGroupName" : String,
  "MaxAggregationInterval" : Integer,
  "ResourceId" : String,
  "ResourceType" : String,
  "Tags" : [ Tag, ... ],
  "TrafficType" : String
}
```
