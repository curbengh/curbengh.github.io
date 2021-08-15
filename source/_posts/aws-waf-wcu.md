---
title: Calculate Web ACL Capacity Unit (WCU) in AWS WAF
excerpt: Base unit and text transformation
date: 2021-07-23
tags:
- aws
---

As part of my {% post_link aws-waf 'routine review' %} of my company's [AWS WAF](https://aws.amazon.com/waf/) access control lists (ACLs), I also check the WCU of existing web ACLs to see if an ACL still can fit in more rules until it reaches the 1,500 [WCU quota](https://docs.aws.amazon.com/waf/latest/developerguide/limits.html). While checking an ACL's WCU, I also find it useful to also check WCU of individual rules to locate any rule with larger-than-usual WCU.

While individual and total WCU are shown during ACL creation/modification on the management console, a read-only role could only check the total WCU. It may be possible to use `CheckCapacity` [CLI](https://docs.aws.amazon.com/cli/latest/reference/wafv2/check-capacity.html) or [API](https://docs.aws.amazon.com/waf/latest/APIReference/API_CheckCapacity.html) by separating each rule as an ACL, but that'll involve excessive (online) API calls.

I further improved my script [waf-acl.py](https://gitlab.com/curben/aws-scripts/-/blob/main/waf-acl.py) by implementing _offline_ WCU calculation. While the [AWS docs](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statements-list.html) has a complete list of WCU of each match statement, I find the text transformation part is not clear enough.

>  For each Text transformation that you apply, add 10 WCUs.

It implies that any time you use text transformation, you gotta add 10 units. When I used this assumption, my calculation was off by a mile. It is more accurate to say:

>  For each _unique_ Text transformation that you apply, add 10 WCUs.

For the purpose of WCU, a text transformation is actually made up of two components: [request component](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-fields.html#waf-rule-statement-request-component) and [transformation action](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-fields.html#waf-rule-statement-transformation).

For example, URI path (request component) is transformed to lowercase (a transformation action), `(URI path + lowercase)` are considered as one unique text transformation. `(URI path + lowercase)` can be applied multiple times within a rule (through nested statements) and even _within_ an ACL, it will still be counted one transformation only.

This means I need to account for repeated text transformation within a rule, so that it's calculated only once. This is easily achieved through the use of [Python Sets](https://docs.python.org/3/tutorial/datastructures.html#sets). The same applies when calculating total WCU of an ACL. When a unique text transformation is applied across different rules in an ACL, the sum of all rules' WCU will be less than the ACL's WCU.

When transforming a Header, it's counted based on a specific header. For example, rule A has `(Header(User-Agent) + lowercase)` and rule B has `(Header(Cookies) + lowercase)`, these are counted as two transformations, so they'll use 20 WCUs.
