---
title: Updating lookup and dashboard through Splunk app update
excerpt: Splunk Cloud and Enterprise behave differently
date: 2024-12-12
updated: 2025-01-05
tags:
  - splunk
---

I store all Splunk system configuration and application's knowledge objects (alerts, lookups, dashboards, etc) in a Git repository for version tracking. The repository is used as the source of truth, meaning any change--however miniscule--has to be committed to the repo first before deploying it. Under [DevOps](https://en.wikipedia.org/wiki/DevOps), although this achieves GitOps, but falls short of CI/CD: there is no config validation and changes cannot be reliably deployed automatically.

Adherence to GitOps requires strict discipline, once you gone down this path, Splunk Web should not be used to change settings unless necessary, instead changes should be be made either through editing configuration files directly or app update. This is especially important in Splunk Cloud, once an app-level configuration is modified through Splunk Web, it will be saved to `local` folder of the app. Once that happened, the configuration file can no longer be updated through app update because uploading an app with `local` folder will not pass the [cloud vetting](https://dev.splunk.com/enterprise/docs/developapps/testvalidate/appinspect/).

This does not mean Splunk Web cannot be used at all to change settings. In Splunk Cloud, [system/global-level](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Wheretofindtheconfigurationfiles#Global_configuration_files) (compared to to app-level) settings can _only_ be modified through Web due to lack of direct file access (i.e. you can't ssh into the instance to edit files in `$SPLUNK_HOME/etc/system/local/`). Some system-level settings include SSO ([authentication.conf](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Authenticationconf)) and role capabilities ([authorize.conf](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Authorizeconf).)

| Knowledge Object                                                                                                                                 | Enterprise¹ | Cloud |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----- |
| [Configuration files](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Wheretofindtheconfigurationfiles#App.2Fuser_configuration_files) | Y           | Y     |
| [Lookup table files](#lookup-table-files)                                                                                                        | Y           | N     |
| [Dashboards](#dashboards)                                                                                                                        | Y           | N     |

- Y: Replace
- N: Retain
- ¹Assuming "Upgrade app" is checked.

## Lookup table files

In Splunk Cloud, installing a newer app version with updated CSVs will not replace the content of existing ones. This does not sound intuitive, to replace them, you have to _delete_ the relevant CSV in Splunk Web (Settings -> Lookups -> Table files -> Delete). If an app package includes lookup files (under `lookups`), deleting them through the settings will not actually delete, but rather _restore_ them to the packaged version. To actually delete them, you have to delete them from the app package, install that package, then delete again in the lookups setting.

In Splunk Enterprise, any change to the lookups of the app package will always replace the installed version during app update, including content change and lookup deletion.

## Dashboards

In Splunk Cloud, even if a dashboard was never modified through Splunk Web, installing a newer app version does not replace existing ones, as if the dashboard XML in the `default` is automatically copied to the `local` folder upon installation. Since there is no way to delete the dashboards (in order to _restore_ them to the original `default`), the only way I can think of is through app reinstallation (uninstall then install). Since reinstallation is rather drastic as it results in temporary lost of [alerts](https://gitlab.com/curben/splunk-scripts/-/tree/main/threat-hunting) and lookups depended by them, I create separate apps that only have dashboards, then another set of apps for everything else.
