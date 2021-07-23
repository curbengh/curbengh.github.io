#!/usr/bin/env python

# MIT license (c) 2021 Ming Di Leom
# Download AWS WAF's Web ACLs and convert them into human-readable format.
# Usage: ./waf-acl.py --profile {profile-name} --directory output-dir --original
# Requirements: pip -q install boto3

from argparse import ArgumentParser
import boto3
from botocore.config import Config
from datetime import date
from json import dump
from os import path
from pathlib import Path

parser = ArgumentParser(description = 'For the provided profile, download all web ACLs in human-readable format.')
parser.add_argument('--profile', '-p',
  help = 'AWS profile name. Parsed from ~/.aws/credentials.',
  required = True)
parser.add_argument('--directory', '-d',
  help = 'Output folder. Exported links will be saved in the current folder if not specified.',
  default = '')
parser.add_argument('--original', '-a',
  help = 'Also download raw ACLs.',
  action = 'store_true')
parser.add_argument('--wcu', '-w',
  help = 'Calculate WCU value of each rule.',
  action = 'store_true')
parser.add_argument('--total-wcu', '-t',
  help = 'Shows the total WCU of each web ACL.',
  action = 'store_true')
args = parser.parse_args()
profile = args.profile
original = args.original
dirPath = args.directory
Path(dirPath).mkdir(parents = True, exist_ok = True)
show_wcu = args.wcu
show_total_wcu = args.total_wcu

today = date.today().strftime('%Y%m%d')

session = boto3.session.Session(profile_name = profile)
# Cloudfront ACLs uses us-east-1 region
my_config = Config(region_name = 'us-east-1')
client = session.client('wafv2', config = my_config)
# Modify the scope for regional WAF
web_acls = client.list_web_acls(Scope = 'CLOUDFRONT')['WebACLs']

def byteToString(bts):
  if isinstance(bts, bytes):
    return str(bts, encoding = 'utf-8')
  return bts

# Parse first key of a dictionary
def first_key(obj):
  return list(obj.keys())[0]

def field_to_match(obj):
  return first_key(obj).lower() \
  if 'SingleHeader' not in obj \
  else obj['SingleHeader']['Name'].lower()

def parse_statement(obj):
  first_key_obj = first_key(obj)
  text = first_key_obj
  wcu_statement = {}

  if first_key_obj == 'NotStatement' or first_key_obj == 'ByteMatchStatement':
    not_prefix = ''
    search_string = ''
    field_match = ''
    positional_constraint = ''

    if first_key_obj == 'NotStatement':
      not_prefix = 'NOT '
      obj = obj['NotStatement']['Statement']
      first_key_obj = first_key(obj)

    if first_key_obj == 'ByteMatchStatement':
      search_string = byteToString(obj['ByteMatchStatement']['SearchString'])
      field_match = first_key(obj['ByteMatchStatement']['FieldToMatch']) \
      if first_key(obj['ByteMatchStatement']['FieldToMatch']) != 'SingleHeader' \
      else obj['ByteMatchStatement']['FieldToMatch']['SingleHeader']['Name']
      positional_constraint = obj['ByteMatchStatement']['PositionalConstraint']

      # WCU Calculation
      wcu_statement['statement'] = 'string_match'
      # assume single-element TextTransformations
      wcu_statement['text_transform'] = obj['ByteMatchStatement']['TextTransformations'][0]['Type'].lower()
      wcu_statement['base'] = positional_constraint.lower()
      if 'TextTransformations' in obj['ByteMatchStatement']:
        wcu_statement['field'] = field_to_match(obj['ByteMatchStatement']['FieldToMatch'])
    elif first_key_obj == 'IPSetReferenceStatement':
      search_string = obj['IPSetReferenceStatement']['ARN']
      positional_constraint = 'IPSet'
      wcu_statement['statement'] = 'ipset'

    separator = '=' if len(field_match) >= 1 else ''
    text = f'{not_prefix}{field_match}{separator}{positional_constraint}({search_string})'
  elif first_key_obj == 'SqliMatchStatement' or first_key_obj == 'XssMatchStatement':
    text = f'{first_key_obj}({first_key(obj[first_key_obj]["FieldToMatch"])})'
    if first_key_obj == 'SqliMatchStatement':
      wcu_statement['statement'] = 'sql'
      wcu_statement['text_transform'] = obj['SqliMatchStatement']['TextTransformations'][0]['Type'].lower()

      if 'TextTransformations' in obj['SqliMatchStatement']:
        wcu_statement['field'] = field_to_match(obj['SqliMatchStatement']['FieldToMatch'])
    else:
      wcu_statement['statement'] = 'xss'
      wcu_statement['text_transform'] = obj['XssMatchStatement']['TextTransformations'][0]['Type'].lower()

      if 'TextTransformations' in obj['XssMatchStatement']:
        wcu_statement['field'] = field_to_match(obj['XssMatchStatement']['FieldToMatch'])

  return {
    'text': text,
    'wcu_statement': wcu_statement
  }

# Make rule statements human-readable
def parse_rule(obj):
  text = ''
  first_key_obj = first_key(obj)
  wcu_rule = []

  if first_key_obj == 'AndStatement' or first_key_obj == 'OrStatement':
    and_or = 'AND' if first_key_obj == 'AndStatement' else 'OR'
    open_paren = '(' if first_key_obj == 'OrStatement' else ''
    close_paren = ')' if first_key_obj == 'OrStatement' else ''
    statements = obj[first_key_obj]['Statements']

    for i in range(0, len(statements)):
      statement = statements[i]
      rule = parse_statement(statement)['text']

      if first_key(statement) == 'AndStatement' or first_key(statement) == 'OrStatement':
        rule = parse_rule(statement)['text']
        wcu_rule.extend(parse_rule(statement)['wcu_rule'])
      else:
        wcu_rule.append(parse_statement(statement)['wcu_statement'])

      if i == 0:
        text = f'{open_paren}{rule}'
      elif i == len(statements) - 1:
        text = f' {text} {and_or} {rule}{close_paren}'
      else:
        text = f' {text} {and_or} {rule}'
  elif first_key_obj == 'IPSetReferenceStatement':
    text = f'IPSet({obj["IPSetReferenceStatement"]["ARN"]})'
  else:
    # unknown rule statement
    print(first_key_obj)

  return {
    'text': text.strip(),
    'wcu_rule': wcu_rule
  }

wcu_dict = {
  'ipset': 1,
  'exactly': 2,
  'starts_with': 2,
  'ends_with': 2,
  'contains': 10,
  'contains_word': 10,
  'sql': 20,
  'xss': 40,
  'text_transform': 10
}

for web_acl in web_acls:
  web_acl_rule = client.get_web_acl(
    Name = web_acl['Name'],
    Scope = 'CLOUDFRONT',
    Id = web_acl['Id']
  )

  if original:
    with open(path.join(dirPath, f'{web_acl["Name"]}-original-{today}.json'), mode = 'w') as f:
      # response may contain byte data that json.dump() doesn't like, hence byteToString()
      dump(web_acl_rule['WebACL'], f, indent = 2, default = byteToString)

  rules = []
  web_acl_wcu = 0
  web_acl_text_transform = set()
  for rule in web_acl_rule['WebACL']['Rules']:
    out_rule = {
      # Name: "Rule"
      # Action: "Allow|Block"
    }

    out_rule[rule['Name']] = parse_rule(rule['Statement']).strip()
    out_rule['Action'] = 'Allow' if first_key(rule['Action']) == 'Allow' else 'Block'

    # WCU calculation
    if show_wcu or show_total_wcu:
      statements = parse_rule(rule['Statement'])['wcu_rule']

      if len(statements) >= 1:
        rule_wcu = 0
        rule_text_transform = set()

        for statement in statements:
          rule_statement = statement['statement']
          if rule_statement == 'ipset' or rule_statement == 'sql' or rule_statement == 'xss':
            web_acl_wcu = web_acl_wcu + wcu_dict[rule_statement]
            rule_wcu = rule_wcu + wcu_dict[rule_statement]
          elif rule_statement == 'string_match':
            web_acl_wcu = web_acl_wcu + wcu_dict[statement['base']]
            rule_wcu = rule_wcu + wcu_dict[statement['base']]

          if 'text_transform' in statement:
            text_transform_key = statement['text_transform'] + statement['field']

            if text_transform_key not in web_acl_text_transform:
              web_acl_wcu = web_acl_wcu + wcu_dict['text_transform']
              web_acl_text_transform.add(text_transform_key)

            if text_transform_key not in rule_text_transform:
              rule_wcu = rule_wcu + wcu_dict['text_transform']
              rule_text_transform.add(text_transform_key)

        if show_wcu:
          out_rule['WCU'] = rule_wcu

    rules.append(out_rule)

  with open(path.join(dirPath, f'{web_acl["Name"]}-{today}.json'), mode = 'w') as f:
    dump(rules, f, indent = 2)

  if show_total_wcu:
    print(f'{web_acl["Name"]} consumes {web_acl_wcu} WCU.')
