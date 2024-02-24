---
title: Applying default-deny ACL in Splunk app
excerpt: Isolate access between roles
date: 2024-02-24
tags:
  - splunk
---

When I first started creating custom Splunk app, I had an incorrect understanding of access control list (ACLs) configured using [default.meta.conf](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Defaultmetaconf) (located at app_folder/metadata/default.meta) whereby I could grant read access to a role like this:

```conf
[]
access = read : [ roleA ], write : [ ]

[lookups/lookupB.csv]
access = read : [ roleA, roleB ], write : [ ]
```

Or like this:

```conf
[]
access = read : [ roleA ], write : [ ]

[lookups]
access = read : [ roleA, roleB ], write : [ ]
```

None of the above configs will grant roleB read access to lookupB.csv. For the rest of this discussion, we assume that roleB should have access to lookupB.csv only.

```md
# Interaction of ACLs across app-level, category level, and specific object configuration:

- To access/use an object, users must have read access to:
  - the app containing the object
  - the generic category within the app (for example, [views])
  - the object itself
- If any layer does not permit read access, the object will not be accessible.
```

> For brevity, this article will only discuss about read access which has slightly different interaction of ACLs. Don't worry, once you understood read access, it's much easier to understand write access.

Notice a role must at least have read access to the app. The simplest way to grant roleB read access is,

```conf
[]
access = read : [ roleA, roleB ], write : [ ]
```

While the above config is effective, but it does not meet the access requirement: roleB is granted read access to every objects in that app.

roleB can be restricted as such:

```conf
[]
access = read : [ roleA, roleB ], write : [ ]

[lookups/lookupA.csv]
access = read : [ roleA ], write : [ ]

[lookups/lookupB.csv]
access = read : [ roleA, roleB ], write : [ ]

[lookups/lookupC.csv]
access = read : [ roleA ], write : [ ]
```

It is effective and meets the requirement, but there is an issue. Every new lookup/object will now need to specify `access = read : [ roleA ], write : [ ]` to restrict roleB's access. This is similar to a default-allow firewall.

## Default-deny ACL

How to implement default-deny ACL? We can achieve it by separating into two apps: appA is accessible to roleA only, appB is accessible to roleA and roleB. Any object we want to share with roleA and roleB, we put it in appB instead.

```conf appA
[]
access = read : [ roleA ], write : [ ]
```

```conf appB
[]
access = read : [ roleA, roleB ], write : [ ]
```

In this approach, every new objects created in appA will not be accessible to roleB because it does not have app access.
