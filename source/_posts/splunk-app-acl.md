---
title: Applying default-deny ACL in Splunk app
excerpt: Isolate access between roles
date: 2024-02-24
tags:
  - splunk
---

When I first started creating custom Splunk app, I had an incorrect understanding of access control list (ACLs) configured using [default.meta.conf](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Defaultmetaconf) (located at app_folder/metadata/default.meta) whereby I could grant read access to a role like this:

```plain
[]
access = read : [ roleA ], write : [ ]

[lookups/lookupB.csv]
access = read : [ roleA, roleB ], write : [ ]
```

Or like this:

```plain
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

> For brevity, this article will only discuss about read access which has slightly different interaction of ACLs compared to write access. Don't worry, once you understood read access, it's much easier to understand write access.

Notice a role must at least have read access to the app. The simplest way to grant roleB read access is,

```plain
[]
access = read : [ roleA, roleB ], write : [ ]
```

While the above config is effective, but it does not meet the access requirement: roleB is granted read access to every objects in that app.

roleB can be restricted as such:

```plain
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

```plain appA
[]
access = read : [ roleA ], write : [ ]
```

```plain appB
[]
access = read : [ roleA, roleB ], write : [ ]
```

In this approach, every new objects created in appA will not be accessible to roleB because it does not have app access.

## Non-removable lookup file

I noticed lookup files that have object-level ACL, e.g.

```plain
[lookups/lookupC.csv]
access = read : [ roleA ], write : [ ]
```

makes it non-removable, even with admin/sc-admin role.

My theory is that the object is non-removable to prevent the ACL from being orphaned. But this theory does not hold, at least for a lookup file that is shipped with an app; deleting a lookup file merely resets its content back to the app's version. Deleting a lookup file is necessary during an app update that also have updated content of a bundled lookup file. Even when a lookup was never modified, Splunk will keep the content during an app update. Updating an app does not automatically update the bundled lookup, the lookup will only be updated after a delete operation.

Similar limitation (i.e. app update does not update the app's object) also applies to dashboards. However, there is no way to delete a dashboard xml in Splunk Cloud, so updating a dashboard through app update always require app uninstallation beforehand.
