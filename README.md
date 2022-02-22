# sites-sync

Tools for automate syncing of dynamic data (content like database and files) between sites
(production, staging development, local and other workspaces).

To configure list of sites you must copy a `node_modules/sites-sync/sites-sync.example.yaml` file
to `sites-sync.yaml` into root of your project, and describe in it list of databases and file locations.

You can use environment variable to not store secrets as plain text in config file.

## Usage

You can launch sites-sync tool using `yarn sites-sync` (or `yarn ss` as shortern
alias) to show list of available commands, like this:

```
Usage: sites-sync <command> [options]

Commands:
  sites-sync pull               Pull databases and directories from remote site.
                                                                    [aliases: p]
  sites-sync push               Push databases and directories to remote site.
  sites-sync terminal           Open interactive terminal to remote site.
                                                                    [aliases: t]
  sites-sync exec <cmd>         Execute command on remote site.     [aliases: e]
  sites-sync backup             Make a backup of current site to backup director
                                y (databases and directories).      [aliases: b]
  sites-sync restore            Restore current site from backup directory (data
                                bases and directories).             [aliases: r]
  sites-sync delete-backups     Delete all backups from backup directory
  sites-sync db-dump [db-id]    Dump database to stdout.
  sites-sync db-query [db-id]   Execute db query from stdin.
  sites-sync db-clear [db-id]   Clear current database.
  sites-sync db-import [db-id]  Import database dump from stdin.
  sites-sync db-pull            Pull database from remote site.
  sites-sync db-push            Push database to remote site.
  sites-sync directory-pull     Pull all directories from remote site.
  sites-sync directory-push     Push all directories to remote site.
  sites-sync id                 Outputs an id of current site.
  sites-sync upstream           Outputs an id of default upstream site.
                                                                   [aliases: us]

Options:
      --version  Show version number                                   [boolean]
  -s, --site     Use custom upstream site id                            [string]
  -h, --help     Show help                                             [boolean]
```
