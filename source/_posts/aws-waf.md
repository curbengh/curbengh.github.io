---
title: Convert AWS WAF ACLs to human-readable format
excerpt: Run the attached script to download and convert ACLs
date: 2021-06-27
updated: 2021-07-23
tags:
- aws
- security
---

I regularly need to audit my company's access control lists (ACLs) implemented in [AWS WAF](https://aws.amazon.com/waf/), as part of my job. Each ACL can be more than a thousand lines which is practically impossible to read. I wrote a script that downloads and summarises the ACLs into human-readable format; each one-thousand-line behemoth is transformed into a fifty-line summary that I can _actually_ audit.

The script is [available here](https://gitlab.com/curben/aws-scripts/-/blob/main/waf-acl.py). It currently only supports Cloudfront ACL, feel free to extend it to support regional ACL.

```
./waf-acl.py --profile {profile-name} --directory {output-dir} --original --wcu --total-wcu
```

**profile-name**: The profile name as listed in "~/.aws/credentials".
**directory**: Output directory. It will be created if not exist. Defaults to current folder.
**original**: Preserve the original ACL after conversion and save it with "-original" suffix.

## ACL schema

The underlying format of a web ACL is JSON. In this use case, I'm only concern with two keys:

``` json
{
  "Name": "",
  "Rules": [
    {
      "Name": "",
      "Statement": {},
      "Action": {
        "Block": {}
      }
    },
    {
      "Name": "",
      "Statement": {},
      "Action": {
        "Allow": {}
      }
    }
  ]
}
```

The script names each ACL according to the value of "Name". "Rules" is an array of objects, where each object represents a rule. Each rule has an [action](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-action.html) of count, allow or block.

In each rule, there is a statement and it functions as a matching condition. Each [statement](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statements-list.html) can contain one or match statements combined using logical rule (AND, NOT, OR).

## Converted schema

A converted ACL has an array of objects, each object has three keys.

``` json
[
  {
    "Name": "",
    "Action": "",
    "Rule": ""
  }
]
```

## And/OrStatement

``` json Original
{
  "Name": "ruleA",
  "Statement": {
    "OrStatement": {
      "Statements": [
        {
          "foo": {}
        },
        {
          "bar": {}
        }
      ]
    }
  }
}
```

``` json Converted
{
  "ruleA": "foo OR bar"
}
```

## Nested And/OrStatement

``` json Original
{
  "Name": "ruleA",
  "Statement": {
    "AndStatement": {
      "Statements": [
        {
          "OrStatement": {
            "Statements": [
              {
                "foo": {}
              },
              {
                "bar": {}
              }
            ]
          }
        },
        {
          "baz": {}
        }
      ]
    }
  }
}
```

``` json Converted
{
  "ruleA": "(foo OR bar) AND baz"
}
```

## NotStatement

``` json Original
{
  "Name": "ruleA",
  "Statement": {
    "NotStatement": {
      "Statement": {
        "foo": {}
      }
    }
  }
}
```

``` json Converted
{
  "ruleA": "NOT foo"
}
```


## String match

``` json Orignal
{
  "ByteMatchStatement": {
    "SearchString": ".conf",
    "FieldToMatch": {
      "UriPath": {}
    },
    "PositionalConstraint": "ENDS_WITH"
  }
}
```

``` plain Converted
UriPath=ENDSWITH(.conf)
```
