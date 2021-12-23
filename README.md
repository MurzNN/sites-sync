# sites-sync
Tools for automate sync of dynamic data (content like database and files) between sites as npm js package.

To configure list of sites you must copy a `node_modules/sites-sync/sites-sync.example.yaml` file
to `sites-sync.yaml` in root of your project, describe database access and commands to access sites.

## Usage
```
Usage: sites-sync <command> [options]

Commands:
  sites-sync shell         Interactive shell to remote site.    [aliases: sh, s]
  sites-sync exec          Execute command on remote site.          [aliases: e]
  sites-sync db-dump       Dump database to output.
  sites-sync db-query      Execute db query from stdin.
  sites-sync db-clear      Clear current database.
  sites-sync db-import     Import database dump from stdin.
  sites-sync db-pull       Pull database from remote site.
  sites-sync storage-pull  Pull all storages from remote site.
  sites-sync pull          Pull all databases and storages from remote site.
```