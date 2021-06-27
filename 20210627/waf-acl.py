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
args = parser.parse_args()
profile = args.profile
original = args.original
dirPath = args.directory
Path(dirPath).mkdir(parents = True, exist_ok = True)

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

def parse_statement(obj):
  first_key_obj = first_key(obj)
  text = first_key_obj

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
    elif first_key_obj == 'IPSetReferenceStatement':
      search_string = obj['IPSetReferenceStatement']['ARN']
      positional_constraint = 'IPSet'

    separator = '=' if len(field_match) >= 1 else ''
    text = f'{not_prefix}{field_match}{separator}{positional_constraint}({search_string})'
  elif first_key_obj == 'SqliMatchStatement' or first_key_obj == 'XssMatchStatement':
    text = f'{first_key_obj}({first_key(obj[first_key_obj]["FieldToMatch"])})'

  return text

# Make rule statements human-readable
def parse_rule(obj):
  text = ''
  first_key_obj = first_key(obj)

  if first_key_obj == 'AndStatement' or first_key_obj == 'OrStatement':
    and_or = 'AND' if first_key_obj == 'AndStatement' else 'OR'
    open_paren = '(' if first_key_obj == 'OrStatement' else ''
    close_paren = ')' if first_key_obj == 'OrStatement' else ''
    statements = obj[first_key_obj]['Statements']

    for i in range(0, len(statements)):
      statement = statements[i]
      rule = parse_statement(statement)

      if first_key(statement) == 'AndStatement' or first_key(statement) == 'OrStatement':
        rule = parse_rule(statement)

      if i == 0:
        text = f'{open_paren}{rule}'
      elif i == len(statements) - 1:
        text = f' {text} {and_or} {rule}{close_paren}'
      else:
        text = f' {text} {and_or} {rule}'
  elif first_key_obj == 'IPSetReferenceStatement':
    text = f'IPSet({obj["IPSetReferenceStatement"]["ARN"]})'
  else:
    text = first_key_obj

  return text.strip()

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
  for rule in web_acl_rule['WebACL']['Rules']:
    out_rule = {
      # Name: "Rule"
      # Action: "Allow|Block"
    }

    out_rule[rule['Name']] = parse_rule(rule['Statement']).strip()
    out_rule['Action'] = 'Allow' if first_key(rule['Action']) == 'Allow' else 'Block'

    rules.append(out_rule)

  with open(path.join(dirPath, f'{web_acl["Name"]}-{today}.json'), mode = 'w') as f:
    dump(rules, f, indent = 2)
